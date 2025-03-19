document.addEventListener("DOMContentLoaded", function() {
    const cover = document.getElementById("cover");
    if (!cover) return;
    
    // Базовая позиция камеры (без смещения)
    const baseCameraPosition = { x: 0, y: 0, z: 40 };
  
    // Предел смещения (в единицах Three.js, можно настроить)
    const maxOffset = 5;
    
    // Переменные для смещения перспективы (целевое и текущее, для плавного перехода)
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
    // Помещаем canvas рендера в секцию обложки, позади контента
    cover.insertBefore(renderer.domElement, cover.firstChild);
    
    // Генеративный объект – TorusKnotGeometry
    const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ffff, roughness: 0.5, metalness: 0.1 });
    const torusKnot = new THREE.Mesh(geometry, material);
    scene.add(torusKnot);
    
    // Освещение
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(25, 50, 25);
    scene.add(pointLight);
    
    // Базовые переменные для анимации модели (циклическое вращение)
    let baseRotationX = 0;
    let baseRotationY = 0;
    
    // Обработчик движения мыши (ПК)
    cover.addEventListener("mousemove", function(event) {
      const rect = cover.getBoundingClientRect();
      // Вычисляем смещение относительно центра элемента (нормализуем в диапазон [-1, 1])
      const offsetX = ((event.clientX - rect.left) - rect.width / 2) / (rect.width / 2);
      const offsetY = ((event.clientY - rect.top) - rect.height / 2) / (rect.height / 2);
      // Применяем коэффициент смещения
      targetOffset.x = offsetX * maxOffset;
      // Для оси Y часто требуется инверсия, чтобы движение мыши вверх давало положительное смещение
      targetOffset.y = -offsetY * maxOffset;
    });
    
    // Обработчик ориентации устройства (мобильные устройства)
    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", function(event) {
        // event.gamma – поворот вокруг оси X (наклон влево/вправо), event.beta – наклон вперед/назад
        // Нормализуем значения (при небольших наклонах, примерно ±45°)
        // Используем коэффициенты, можно настроить для нужной чувствительности
        targetOffset.x = THREE.MathUtils.clamp(event.gamma / 45 * maxOffset, -maxOffset, maxOffset);
        targetOffset.y = THREE.MathUtils.clamp(event.beta / 45 * maxOffset, -maxOffset, maxOffset);
      }, true);
    }
    
    // Если нужно, можно добавить обработчик devicemotion для дополнительной информации
    // window.addEventListener("devicemotion", function(event) {
    //   // Например, можно использовать event.accelerationIncludingGravity для небольших поправок
    // }, true);
    
    // Анимация (обновление модели и перспективы)
    function animate() {
      requestAnimationFrame(animate);
      
      // Циклическое вращение модели (не зависит от смещения камеры)
      baseRotationX += 0.01;
      baseRotationY += 0.01;
      torusKnot.rotation.x = baseRotationX;
      torusKnot.rotation.y = baseRotationY;
      
      // Плавно интерполируем текущие смещения к целевым (линейное затухание)
      currentOffset.x += (targetOffset.x - currentOffset.x) * 0.1;
      currentOffset.y += (targetOffset.y - currentOffset.y) * 0.1;
      
      // Обновляем позицию камеры с учетом базовой позиции и текущего смещения
      camera.position.x = baseCameraPosition.x + currentOffset.x;
      camera.position.y = baseCameraPosition.y + currentOffset.y;
      // Камера остается на той же дистанции по оси Z
      camera.position.z = baseCameraPosition.z;
      // Камера всегда смотрит в центр сцены
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
  