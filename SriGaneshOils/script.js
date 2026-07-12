// Wait for all structural assets to register
document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Dynamic Smooth Navigation Highlight Trackers ---
    const navigationLinks = document.querySelectorAll('.nav-link');
    
    navigationLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Remove selection class from old target
            document.querySelector('.nav-link.active')?.classList.remove('active');
            // Assign selection layer
            this.classList.add('active');
        });
    });

    // --- 2. View Product Information Interaction ---
    const detailsButtons = document.querySelectorAll('.btn-details');
    const productCards = document.querySelectorAll('.product-card');
    const productModal = document.getElementById('productModal');
    const closeModalBtn = document.getElementById('closeModal');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.querySelector('.modal-description');
    const modalPrice = document.getElementById('modalPrice');
    const modalVariants = document.getElementById('modalVariants');
    const modalOrderBtn = document.getElementById('modalOrderBtn');

    const productDetails = {
        'Cold Pressed Groundnut Oil': {
            price: '₹175 / 500ml, ₹350 / 1 Ltr, ₹1750 / 5 Ltr',
            variants: '500ml • 1 Ltr • 5 Ltr',
            description: 'Made from carefully selected groundnuts and cold pressed in small batches for a rich aroma, heart-healthy fats, and deep cooking flavor. Ideal for South Indian cooking, seasoning, and natural body care.'
        },
        'Cold Pressed Sesame Oil': {
            price: '₹225 / 500ml, ₹450 / 1 Ltr, ₹2250 / 5 Ltr',
            variants: '500ml • 1 Ltr • 5 Ltr',
            description: 'Traditional sesame oil pressed cold to preserve its nutrient-rich profile, antioxidants, and warming taste. Perfect for cooking, massage therapy, and daily wellness routines.'
        },
        'Cold Pressed Coconut Oil': {
            price: '₹265 / 500ml, ₹530 / 1 Ltr, ₹2650 / 5 Ltr',
            variants: '500ml • 1 Ltr • 5 Ltr',
            description: 'Pure virgin coconut oil extracted from fresh coconuts. Use it for cooking, hair care, skincare, and natural remedies with the natural, unrefined aroma intact.'
        },
        'Premium Groundnut Seeds': {
            price: '₹80 / 500g, ₹160 / 1 Kg, ₹800 / 5 Kg',
            variants: '500g • 1 Kg • 5 Kg',
            description: 'Premium grade groundnut seeds selected for high oil yield and superior taste. Ideal for home pressing, roasting, or using as raw ingredients for culinary and snack preparations.'
        },
        'Premium Sesame Seeds': {
            price: '₹125 / 500g, ₹250 / 1 Kg, ₹1250 / 5 Kg',
            variants: '500g • 1 Kg • 5 Kg',
            description: 'Top-quality sesame seeds with a rich, nutty profile and reliable freshness. Great for cold pressing, cooking, and adding crunch to traditional recipes.'
        }
    };

    const showProductInfo = (productName) => {
        const details = productDetails[productName] || {
            price: 'Contact for pricing',
            variants: 'Ask for available sizes',
            description: 'Please ask us for the latest product details and pricing on WhatsApp.'
        };

        modalTitle.textContent = productName;
        modalDescription.textContent = details.description;
        modalPrice.textContent = details.price;
        modalVariants.textContent = details.variants;
        modalOrderBtn.href = `https://wa.me/919491352664?text=Hi,%20I%20want%20to%20order%20${encodeURIComponent(productName)}.`;
        productModal.classList.add('active');
        productModal.setAttribute('aria-hidden', 'false');
    };

    const closeProductModal = () => {
        productModal.classList.remove('active');
        productModal.setAttribute('aria-hidden', 'true');
    };

    detailsButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const productCard = e.target.closest('.product-card');
            const productName = productCard.getAttribute('data-product-name');
            showProductInfo(productName);
        });
    });

    productCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.btn-details') || e.target.closest('.close-modal')) return;
            const productName = card.getAttribute('data-product-name');
            showProductInfo(productName);
        });
    });

    closeModalBtn.addEventListener('click', closeProductModal);
    modalCloseBtn.addEventListener('click', closeProductModal);
    productModal.querySelector('.product-modal-backdrop').addEventListener('click', closeProductModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && productModal.classList.contains('active')) {
            closeProductModal();
        }
    });

    // --- 4. Contact form submission (Formspree or mailto fallback) ---
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');
    if (contactForm) {
        const adminEmail = contactForm.dataset.adminEmail || 'sriganeshoils@gmail.com';

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            formStatus.textContent = '';

            const endpoint = contactForm.action;
            const usingPlaceholder = endpoint.includes('YOUR_FORM_ID') || endpoint.includes('formspree.io/f/YOUR_FORM_ID');

            const formData = new FormData(contactForm);
            const clientEmail = formData.get('email') || '';
            const sendCopy = contactForm.querySelector('#sendCopy')?.checked;
            // include _replyto for Formspree and similar services
            if (clientEmail) formData.set('_replyto', clientEmail);

            // EmailJS client-side integration (if configured via data attributes)
            const ejUser = contactForm.dataset.emailjsUser;
            const ejService = contactForm.dataset.emailjsService;
            const ejTemplate = contactForm.dataset.emailjsTemplate;
            const useEmailJS = ejUser && ejService && ejTemplate && window.emailjs;

            // helper to submit to configured endpoint or open mail client
            const submitToEndpoint = (formDataLocal, usingPlaceholderLocal) => {
                if (!usingPlaceholderLocal) {
                    fetch(endpoint, {
                        method: 'POST',
                        body: formDataLocal,
                        headers: {
                            'Accept': 'application/json'
                        }
                    }).then(async (res) => {
                        if (res.ok) {
                            formStatus.style.color = 'var(--primary-green)';
                            formStatus.textContent = 'Thank you — your message has been sent.';
                            contactForm.reset();
                        } else {
                            const data = await res.json().catch(() => ({}));
                            throw new Error(data.error || 'Submission failed');
                        }
                    }).catch(() => {
                        // fallback to mailto if fetch fails
                        const name = formDataLocal.get('name') || '';
                        const email = formDataLocal.get('email') || '';
                        const message = formDataLocal.get('message') || '';
                        const subject = encodeURIComponent(`Website contact from ${name}`);
                        const body = encodeURIComponent(`Name: ${name}%0AEmail: ${email}%0A%0A${message}`);
                        let mailto = `mailto:${adminEmail}?subject=${subject}&body=${body}`;
                        if (sendCopy && email) {
                            mailto += `&cc=${encodeURIComponent(email)}`;
                        }
                        window.location.href = mailto;
                    });
                } else {
                    const name = formDataLocal.get('name') || '';
                    const email = formDataLocal.get('email') || '';
                    const message = formDataLocal.get('message') || '';
                    const subject = encodeURIComponent(`Website contact from ${name}`);
                    const body = encodeURIComponent(`Name: ${name}%0AEmail: ${email}%0A%0A${message}`);
                    formStatus.style.color = 'var(--primary-green)';
                    formStatus.textContent = 'No server configured — opening your email client to send the message.';
                    setTimeout(() => {
                        let mailto = `mailto:${adminEmail}?subject=${subject}&body=${body}`;
                        if (sendCopy && email) {
                            mailto += `&cc=${encodeURIComponent(email)}`;
                        }
                        window.location.href = mailto;
                    }, 600);
                }
            };

            if (useEmailJS) {
                try {
                    window.emailjs.init(ejUser);
                    window.emailjs.sendForm(ejService, ejTemplate, '#contactForm')
                        .then(() => {
                            formStatus.style.color = 'var(--primary-green)';
                            formStatus.textContent = 'Thank you — your message has been sent via EmailJS.';
                            contactForm.reset();
                        }).catch((err) => {
                            console.error('EmailJS error', err);
                            formStatus.style.color = '#c1272d';
                            formStatus.textContent = 'EmailJS failed — falling back to direct submission.';
                            // call the endpoint fallback directly
                            submitToEndpoint(formData, usingPlaceholder);
                        });
                    return; // handled by EmailJS
                } catch (ex) {
                    console.error('EmailJS init/send error', ex);
                    // continue to fallback logic
                }
            }

            // Use the unified submit handler for the remaining logic
            submitToEndpoint(formData, usingPlaceholder);
        });
    }

    // --- 3. Scroll-based Top Bar Motion ---
    const siteLinkInput = document.getElementById('siteLinkInput');
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    const linkStatus = document.getElementById('linkStatus');

    if (siteLinkInput) {
        siteLinkInput.value = window.location.href;
    }

    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', async () => {
            const value = siteLinkInput?.value || window.location.href;
            try {
                await navigator.clipboard.writeText(value);
                linkStatus.textContent = 'Website link copied to clipboard.';
            } catch (err) {
                linkStatus.textContent = 'Copy failed — please copy the link manually.';
            }
        });
    }

    const topBar = document.querySelector('.top-bar');
    let lastScroll = window.scrollY;

    const updateTopBar = () => {
        const currentScroll = window.scrollY;
        if (currentScroll > 20) {
            topBar.classList.add('scrolled');
        } else {
            topBar.classList.remove('scrolled');
        }

        if (currentScroll > lastScroll && currentScroll > 120) {
            topBar.classList.add('scroll-hidden');
        } else {
            topBar.classList.remove('scroll-hidden');
        }

        lastScroll = currentScroll;
    };

    window.addEventListener('scroll', updateTopBar, { passive: true });
    updateTopBar();
});