document.addEventListener("DOMContentLoaded", function() {
    const cover = document.getElementById("cover");
    if (!cover) return;
    
    // Базовая позиция камеры
    const baseCameraPosition = { x: 0, y: 0, z: 40 };
    // Максимальное смещение для параллакса
    const maxOffset = 5;
    
    // Целевое смещение, полученное из сенсоров
    let targetOffset = { x: 0, y: 0 };
    // Текущее смещение, для плавного перехода
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
    
    // Базовое вращение объекта (анимация модели)
    let baseRotationX = 0;
    let baseRotationY = 0;
    
    // Обработчик для ПК: движение мыши
    cover.addEventListener("mousemove", function(event) {
      const rect = cover.getBoundingClientRect();
      const offsetX = ((event.clientX - rect.left) - rect.width / 2) / (rect.width / 2);
      const offsetY = ((event.clientY - rect.top) - rect.height / 2) / (rect.height / 2);
      targetOffset.x = offsetX * maxOffset;
      targetOffset.y = -offsetY * maxOffset;
    });
    
    // Обработчик для мобильных устройств: deviceorientation
    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", function(event) {
        // Здесь берем event.beta (наклон вперед/назад) и event.gamma (наклон влево/вправо)
        // Нормализуем значения с учетом диапазона (примерно ±45°)
        let normGamma = event.gamma; // Y-axis, влево/вправо
        let normBeta  = event.beta;  // X-axis, вперед/назад
        
        // Ограничиваем диапазон, например, до ±45 градусов
        normGamma = Math.max(-45, Math.min(45, normGamma));
        normBeta  = Math.max(-45, Math.min(45, normBeta));
        
        // Преобразуем в смещение: делим на 45 и умножаем на maxOffset
        targetOffset.x = (normGamma / 45) * maxOffset;
        targetOffset.y = -(normBeta  / 45) * maxOffset;
      }, true);
    }
    
    // Анимация: обновление объекта и камеры
    function animate() {
      requestAnimationFrame(animate);
      
      // Циклическое вращение объекта (базовая анимация модели)
      baseRotationX += 0.01;
      baseRotationY += 0.01;
      torusKnot.rotation.x = baseRotationX;
      torusKnot.rotation.y = baseRotationY;
      
      // Плавная интерполяция текущего смещения к целевому
      currentOffset.x += (targetOffset.x - currentOffset.x) * 0.1;
      currentOffset.y += (targetOffset.y - currentOffset.y) * 0.1;
      
      // Обновляем позицию камеры с учетом базовой позиции и смещения параллакса
      camera.position.x = baseCameraPosition.x + currentOffset.x;
      camera.position.y = baseCameraPosition.y + currentOffset.y;
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
  