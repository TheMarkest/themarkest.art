document.addEventListener("DOMContentLoaded", function() {
    const cover = document.getElementById("cover");
    if (!cover) return;
    
    // Создаём сцену Three.js
    const scene = new THREE.Scene();
    
    // Камера
    const camera = new THREE.PerspectiveCamera(75, cover.clientWidth / cover.clientHeight, 0.1, 1000);
    camera.position.z = 40;
    
    // Рендерер
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(cover.clientWidth, cover.clientHeight);
    // Добавляем canvas рендера в секцию обложки, чтобы он был позади контента
    cover.insertBefore(renderer.domElement, cover.firstChild);
    
    // Генеративный объект – TorusKnotGeometry
    const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ffff, roughness: 0.5, metalness: 0.1 });
    const torusKnot = new THREE.Mesh(geometry, material);
    scene.add(torusKnot);
    
    // Добавляем освещение
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(25, 50, 25);
    scene.add(pointLight);
    
    // Базовое вращение и смещения, зависящие от движения
    let baseRotationX = 0;
    let baseRotationY = 0;
    let rotationOffsetX = 0;
    let rotationOffsetY = 0;
    
    // Обработчик движения мыши (ПК)
    cover.addEventListener("mousemove", function(event) {
      const rect = cover.getBoundingClientRect();
      // Смещение относительно центра элемента
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      // Нормализация смещений (чувствительность можно настроить изменяя коэффициенты)
      rotationOffsetY = (x / (rect.width / 2)) * 0.2; // вращение вокруг оси Y
      rotationOffsetX = (y / (rect.height / 2)) * 0.2; // вращение вокруг оси X
    });
    
    // Обработчик событий ориентации устройства (мобильные устройства)
    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", function(event) {
        // event.gamma: наклон влево/вправо (приблизительно от -45 до 45)
        // event.beta: наклон вперед/назад (приблизительно от -45 до 45)
        rotationOffsetY = (event.gamma / 45) * 0.2;
        rotationOffsetX = (event.beta / 45) * 0.2;
      }, true);
    }
    
    // Анимация
    function animate() {
      requestAnimationFrame(animate);
      // Накопление базового вращения
      baseRotationX += 0.01;
      baseRotationY += 0.01;
      // Применение базового вращения с учетом смещений от движения
      torusKnot.rotation.x = baseRotationX + rotationOffsetX;
      torusKnot.rotation.y = baseRotationY + rotationOffsetY;
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
  