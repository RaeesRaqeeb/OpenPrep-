
    const tabs = document.querySelectorAll('.tab');
    const examGrid = document.querySelector('.exam-grid');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Update active tab
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const filter = tab.dataset.filter;

        // Get all cards (both wrapped in <a> and standalone divs)
        const allItems = examGrid.querySelectorAll('[data-category]');

        allItems.forEach(item => {
          const itemCategory = item.dataset.category;
          const isMatch = filter === 'all' || itemCategory === filter;
          item.style.display = isMatch ? '' : 'none';
        });
      });
    });

    const hero = document.querySelector('.hero');

    if (hero) {
      const updateHeroPointer = (clientX, clientY) => {
        const bounds = hero.getBoundingClientRect();
        const x = ((clientX - bounds.left) / bounds.width) * 100;
        const y = ((clientY - bounds.top) / bounds.height) * 100;
        const clampedX = Math.max(0, Math.min(100, x));
        const clampedY = Math.max(0, Math.min(100, y));

        hero.style.setProperty('--hero-mx', `${clampedX}%`);
        hero.style.setProperty('--hero-my', `${clampedY}%`);
      };

      hero.addEventListener('pointermove', (event) => {
        updateHeroPointer(event.clientX, event.clientY);
      });

      hero.addEventListener('pointerleave', () => {
        hero.style.setProperty('--hero-mx', '50%');
        hero.style.setProperty('--hero-my', '45%');
      });
    }
  