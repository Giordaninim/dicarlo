window.addEventListener('DOMContentLoaded', () => {
function onlyNumber (event) {
    var charCode = event.charCode || event.keyCode;
    if(charCode != 8 && charCode != 46 && charCode != 43 && (charCode < 48 || charCode > 57 )) {
        event.preventDefault();
    }
};

document.getElementById('contact-form').addEventListener('submit', function(e) {
    e.preventDefault(); // Previene l'invio normale del form
    var nome = document.getElementById('nome').value;
    var telefono = document.getElementById('telefono').value;
    var email = document.getElementById('email').value;
    var servizi = Array.from(document.getElementById('servizi').selectedOptions)
                      .map(option => option.value)
                      .join(', ');
    var messaggio = document.getElementById('messaggio').value;
    var whatsappMessage = `Nome:${nome} Telefono:${telefono} Email:${email} Servizi_richiesti:${servizi} Messaggio:${messaggio}`;
    var whatsappURL = `https://wa.me/4917631207562?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappURL, '_blank');
    }
);

let slideIndex = 0;
        showSlides();
        
function showSlides() {
    let i;
    let slides = document.getElementsByClassName("mySlides");
    let dots = document.getElementsByClassName("dot");
    for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";  
    }
    slideIndex++;
    if (slideIndex > slides.length) {
    slideIndex = 1
    }    
    for (i = 0; i < slides.length; i++) {
    slides[i].className = slides[i].className.replace(" active", "");
    }
    slides[slideIndex-1].style.display = "block";  
    slides[slideIndex-1].className += " active";
    setTimeout(showSlides, 3500); // Change image every 2 seconds
};
});