const container = document.querySelector('.slide-container');
document.querySelector('.slider').addEventListener('input', (e) => {
    container.style.setProperty('--position', `${e.target.value}%`);
})