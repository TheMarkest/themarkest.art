document.addEventListener("DOMContentLoaded", function() {
    const cover = document.getElementById("cover");
    if (!cover) return;
    
    // Определяем, мобильное ли устройство (простейшая проверка)
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    
    // Базовая позиция камеры; если мобильное – камера дальше
    const baseCameraPosition = { x: 0, y: 0, z: isMobile ? 60 : 40 };
    // Максимальное смещение камеры для параллакса (интенсивность эффекта)
    const maxOffset = 30;
    // Коэффициент преобразования углов в смещение (1 градус = 1 единица)
    const parallaxFactor = 1.0;
    
    // Целевое и текущее смещения камеры для плавного перехода
    let targetOffset = { x: 0, y: 0 };
    let currentOffset = { x: 0, y: 0 };
  
    // Создаем сцену и задаем фон
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);
    
    // Камера
    const camera = new THREE.PerspectiveCamera(75, cover.clientWidth / cover.clientHeight, 0.1, 1000);
    camera.position.set(baseCameraPosition.x, baseCameraPosition.y, baseCameraPosition.z);
    
    // Рендерер
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(cover.clientWidth, cover.clientHeight);
    cover.insertBefore(renderer.domElement, cover.firstChild);
    
    // Центральный объект – TorusKnot в режиме wireframe (проволочный каркас)
    const torusGeometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
    const torusMaterial = new THREE.MeshBasicMaterial({ color: 0x008888, wireframe: true, opacity: 0.8, transparent: true });
    const torusKnot = new THREE.Mesh(torusGeometry, torusMaterial);
    scene.add(torusKnot);
    
    // Дополнительные примитивы с различными траекториями
    const primitives = [];
    
    // Куб: движется по кругу в плоскости XY
    const cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
    const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x883333 });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(-15, 0, 0);
    primitives.push({
      mesh: cube,
      update: function(time) {
        cube.position.x = -15 + Math.cos(time * 0.5) * 5;
        cube.position.y = Math.sin(time * 0.5) * 5;
      }
    });
    
    // Сфера: осциллирует вдоль оси Z
    const sphereGeometry = new THREE.SphereGeometry(3, 32, 32);
    const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0x338833 });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(15, 0, 0);
    primitives.push({
      mesh: sphere,
      update: function(time) {
        sphere.position.z = 10 + Math.sin(time) * 5;
      }
    });
    
    // Конус: движется по эллиптической траектории в плоскости XY
    const coneGeometry = new THREE.ConeGeometry(3, 6, 32);
    const coneMaterial = new THREE.MeshStandardMaterial({ color: 0x333388 });
    const cone = new THREE.Mesh(coneGeometry, coneMaterial);
    cone.position.set(0, -15, 0);
    primitives.push({
      mesh: cone,
      update: function(time) {
        cone.position.x = Math.cos(time * 0.7) * 10;
        cone.position.y = -15 + Math.sin(time * 0.7) * 3;
      }
    });
    
    // Добавляем примитивы в сцену
    primitives.forEach(obj => scene.add(obj.mesh));
    
    // Добавляем систему частиц
    const particleCount = 500;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      // Частицы распределены внутри куба размером 200 единиц
      positions[i * 3] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({ color: 0x888888, size: 1.5, transparent: true, opacity: 0.7 });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
    
    // Освещение: увеличенное ambient light и добавление directional light
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 1.0);
    pointLight.position.set(25, 50, 25);
    scene.add(pointLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 50, 50);
    scene.add(directionalLight);
    
    // Обработчик для ПК: движение мыши
    cover.addEventListener("mousemove", function(event) {
      const rect = cover.getBoundingClientRect();
      const offsetX = ((event.clientX - rect.left) - rect.width / 2) / (rect.width / 2);
      const offsetY = ((event.clientY - rect.top) - rect.height / 2) / (rect.height / 2);
      targetOffset.x = THREE.MathUtils.clamp(offsetX * maxOffset, -maxOffset, maxOffset);
      targetOffset.y = THREE.MathUtils.clamp(-offsetY * maxOffset, -maxOffset, maxOffset);
    });
    
    // Обработчик для мобильных: deviceorientation
    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", function(event) {
        let normGamma = Math.max(-45, Math.min(45, event.gamma || 0));
        let normBeta  = Math.max(-45, Math.min(45, event.beta  || 0));
        targetOffset.x = THREE.MathUtils.clamp(normGamma * parallaxFactor, -maxOffset, maxOffset);
        targetOffset.y = THREE.MathUtils.clamp(-normBeta * parallaxFactor, -maxOffset, maxOffset);
      }, true);
    }
    
    // Анимация: обновление модели, частиц и смещения камеры
    function animate() {
      requestAnimationFrame(animate);
      
      // Вращение центрального объекта (wireframe)
      torusKnot.rotation.x += 0.01;
      torusKnot.rotation.y += 0.01;
      
      // Обновление дополнительных примитивов
      const time = performance.now() * 0.001;
      primitives.forEach(obj => {
        if (typeof obj.update === "function") {
          obj.update(time);
        }
      });
      
      // Плавная интерполяция смещения камеры
      currentOffset.x += (targetOffset.x - currentOffset.x) * 0.1;
      currentOffset.y += (targetOffset.y - currentOffset.y) * 0.1;
      
      // Обновляем позицию камеры с учетом параллакса
      camera.position.x = baseCameraPosition.x + currentOffset.x;
      camera.position.y = baseCameraPosition.y + currentOffset.y;
      camera.position.z = baseCameraPosition.z;
      camera.lookAt(scene.position);
      
      renderer.render(scene, camera);
    }
    animate();
    
    // Обработка изменения размеров окна
    window.addEventListener('resize', function() {
      const width = cover.clientWidth;
      const height = cover.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    });
  });
 