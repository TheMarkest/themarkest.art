document.addEventListener("DOMContentLoaded", function() {
    const cover = document.getElementById("cover");
    if (!cover) return;
    
    // Базовая позиция камеры
    const baseCameraPosition = { x: 0, y: 0, z: 40 };
    // Максимальное смещение камеры по осям (чем больше – тем сильнее параллакс)
    const maxOffset = 30;
    // Коэффициент для преобразования углов наклона в смещение (прямая маппинг: 1 градус = 1 единица, с clamping)
    const parallaxFactor = 1.0;
    
    // Целевое и текущее смещения камеры (для плавной интерполяции)
    let targetOffset = { x: 0, y: 0 };
    let currentOffset = { x: 0, y: 0 };
  
    // Создаем сцену Three.js
    const scene = new THREE.Scene();
    
    // Камера
    const camera = new THREE.PerspectiveCamera(75, cover.clientWidth / cover.clientHeight, 0.1, 1000);
    camera.position.set(baseCameraPosition.x, baseCameraPosition.y, baseCameraPosition.z);
    
    // Рендерер
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(cover.clientWidth, cover.clientHeight);
    cover.insertBefore(renderer.domElement, cover.firstChild);
    
    // Основной объект – TorusKnot (анимируется циклически)
    const torusGeometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
    const torusMaterial = new THREE.MeshStandardMaterial({ color: 0x00ffff, roughness: 0.5, metalness: 0.1 });
    const torusKnot = new THREE.Mesh(torusGeometry, torusMaterial);
    scene.add(torusKnot);
    
    // Дополнительные примитивы с разными траекториями
    const primitives = [];
  
    // Куб: движется по кругу в плоскости XY
    const cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
    const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
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
    const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
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
    const coneMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
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
  
    // Обработчик для ПК: движение мыши
    cover.addEventListener("mousemove", function(event) {
      const rect = cover.getBoundingClientRect();
      const offsetX = ((event.clientX - rect.left) - rect.width / 2) / (rect.width / 2);
      const offsetY = ((event.clientY - rect.top) - rect.height / 2) / (rect.height / 2);
      targetOffset.x = THREE.MathUtils.clamp(offsetX * maxOffset, -maxOffset, maxOffset);
      targetOffset.y = THREE.MathUtils.clamp(-offsetY * maxOffset, -maxOffset, maxOffset);
    });
  
    // Обработчик для мобильных устройств: deviceorientation
    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", function(event) {
        // event.beta (наклон вперед/назад) и event.gamma (наклон влево/вправо)
        // Ограничиваем диапазон (например, ±45°) и умножаем на parallaxFactor
        let normGamma = Math.max(-45, Math.min(45, event.gamma || 0));
        let normBeta  = Math.max(-45, Math.min(45, event.beta  || 0));
        targetOffset.x = THREE.MathUtils.clamp(normGamma * parallaxFactor, -maxOffset, maxOffset);
        targetOffset.y = THREE.MathUtils.clamp(-normBeta * parallaxFactor, -maxOffset, maxOffset);
      }, true);
    }
    
    // Анимация: обновление анимации модели, примитивов и смещения камеры
    function animate() {
      requestAnimationFrame(animate);
      
      // Анимация основного объекта (циклическое вращение)
      torusKnot.rotation.x += 0.01;
      torusKnot.rotation.y += 0.01;
      
      // Обновление дополнительных примитивов по их траекториям
      const time = performance.now() * 0.001;
      primitives.forEach(obj => {
        if (typeof obj.update === "function") {
          obj.update(time);
        }
      });
      
      // Плавная интерполяция текущего смещения к целевому
      currentOffset.x += (targetOffset.x - currentOffset.x) * 0.1;
      currentOffset.y += (targetOffset.y - currentOffset.y) * 0.1;
      
      // Обновляем позицию камеры с учетом базовой позиции и смещения параллакса
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
  