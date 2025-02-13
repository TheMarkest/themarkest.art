document.addEventListener("mousemove", function(event) {
    let x = (event.clientX / window.innerWidth - 0.5) * 10;
    let y = (event.clientY / window.innerHeight - 0.5) * 10;
    document.querySelector(".glitch").style.transform = `translate(${x}px, ${y}px)`;
});
