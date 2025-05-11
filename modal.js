document.addEventListener('DOMContentLoaded', function() {
    // Create modal element
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <span class="modal-close">&times;</span>
        <img class="modal-content" id="modal-img">
    `;
    document.body.appendChild(modal);

    // Get modal elements
    const modalImg = document.getElementById("modal-img");
    const closeBtn = document.querySelector(".modal-close");

    // Add click event to all zoomable images
    document.querySelectorAll('.zoomable').forEach(img => {
        img.addEventListener('click', function() {
            modal.style.display = "block";
            modalImg.src = this.src;
            modalImg.style.cursor = 'zoom-out';
        });
    });

    // Close modal when clicking close button, modal image, or outside
    function closeModal() {
        modal.style.display = "none";
        modalImg.style.cursor = 'default';
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