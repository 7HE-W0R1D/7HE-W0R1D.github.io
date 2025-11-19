document.addEventListener('DOMContentLoaded', function() {
    // Create modal element
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = `
        <span class="modal-close" role="button" aria-label="Close">&times;</span>
        <figure class="modal-figure">
            <img class="modal-content" id="modal-img" alt="">
            <figcaption class="modal-caption" id="modal-caption" aria-live="polite"></figcaption>
        </figure>
    `;
    document.body.appendChild(modal);

    // Get modal elements
    const modalImg = document.getElementById("modal-img");
    const modalCaption = document.getElementById("modal-caption");
    const closeBtn = document.querySelector(".modal-close");

    // Add click event to all zoomable images
    document.querySelectorAll('.zoomable').forEach(img => {
        img.addEventListener('click', function() {
            modal.style.display = "block";
            modalImg.src = this.src;
            modalImg.alt = this.alt || '';
            modalCaption.textContent = this.alt || '';
            modalImg.style.cursor = 'zoom-out';
        });
    });

    // Close modal when clicking close button, modal image, or outside
    function closeModal() {
        modal.style.display = "none";
        modalImg.style.cursor = 'default';
        modalImg.alt = '';
        modalCaption.textContent = '';
    }

    closeBtn.onclick = closeModal;
    modalImg.onclick = closeModal;
    modal.onclick = function(e) {
        if (e.target === modal) {
            closeModal();
        }
    }

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === "block") {
            closeModal();
        }
    });
});