

document.querySelectorAll('.dish-button').forEach(button => {
  button.addEventListener('click', () => {
    const footer = button.closest('.dish-footer');
    footer.classList.toggle('expanded');

    const isExpanded = footer.classList.contains('expanded');
    button.textContent = isExpanded ? 'Hide' : 'More details';


    if (isExpanded) {
      const card = button.closest('.dish-card');
      const dishImage = card.querySelector('.dish-image');

      // Добавляем анимацию пульсации
      setTimeout(() => {


        dishImage.classList.add('pulse-shadow');

        // Удаляем класс после завершения анимации, чтобы можно было повторить
        setTimeout(() => {
          dishImage.classList.remove('pulse-shadow');
        }, 2000); // чуть больше, чем длительность анимации
      }, 2500);
    }
  });
});



const overlay = document.querySelector('.image-overlay');
const closeOverlay = document.querySelector('.close-overlay');
const prevButton = document.querySelector('.prev-button');
const nextButton = document.querySelector('.next-button');
const overlayDishName = document.querySelector('.overlay-dish-name');
const carouselTrack = document.querySelector('.carousel-track');



let currentImages = [];
let currentIndex = 0;
let currentDishName = ""

let imageWidth = 255
// const overlayDishName = document.querySelector('.overlay-dish-name');

// Открытие overlay
document.querySelectorAll('.dish-image').forEach(img => {
  img.addEventListener('click', () => {
    const card = img.closest('.dish-card');
    currentImages = JSON.parse(card.getAttribute('data-images'));
    currentIndex = 0;

    currentDishName = img.alt
    openOverlay();
  });
});



function openOverlay() {
  currentImages.forEach(src => {
    const img = document.createElement('img');
    img.src = src;
    carouselTrack.appendChild(img);
  });

  overlay.classList.remove('hidden');
  overlayDishName.textContent = currentDishName;

  updateCarouselPosition();
  toggleNavButtons();
  disableScroll();
}

function updateCarouselPosition() {
  imageWidth = carouselTrack.querySelector('img')?.offsetWidth || 255
  const offset = -currentIndex * imageWidth; // ширина картинки
  carouselTrack.style.transform = `translateX(${offset}px)`;
}
function toggleNavButtons() {
  if (currentImages.length > 1) {
    prevButton.style.display = 'block';
    nextButton.style.display = 'block';
  } else {
    prevButton.style.display = 'none';
    nextButton.style.display = 'none';
  }
}





function disableScroll() {
  document.body.style.overflow = 'hidden';
}

function enableScroll() {
  document.body.style.overflow = '';
}

// Закрытие overlay
closeOverlay.addEventListener('click', () => {
  overlay.classList.add('hidden');
  setTimeout(() => {
    carouselTrack.innerHTML = '';
    carouselTrack.style.transform = "translateX(0)"
  }, 220);

  enableScroll();



});




// Листание
prevButton.addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
  // showOverlayImage();
  updateCarouselPosition();
});

nextButton.addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % currentImages.length;
  // showOverlayImage();
  updateCarouselPosition();
});




// свайп изображений на мобильных



let touchStartX = 0;
let currentTranslate = 0;
let isDragging = false;
; // Можно позже вычислить динамически

carouselTrack.addEventListener('touchstart', e => {
  if (currentImages.length <= 1) return; // если только одно изображение — не двигаем

  touchStartX = e.touches[0].clientX;
  isDragging = true;

  imageWidth = carouselTrack.querySelector('img')?.offsetWidth || 255;
  carouselTrack.style.transition = 'none';
}, { passive: true });

carouselTrack.addEventListener('touchmove', e => {
  if (!isDragging || currentImages.length <= 1) return;

  const touchX = e.touches[0].clientX;
  const deltaX = touchX - touchStartX;

  // Блокировка движения за пределы (влево от первого и вправо от последнего)
  const atFirstImage = currentIndex === 0 && deltaX > 0;
  const atLastImage = currentIndex === currentImages.length - 1 && deltaX < 0;

  if (atFirstImage || atLastImage) return;

  currentTranslate = -currentIndex * imageWidth + deltaX;
  carouselTrack.style.transform = `translateX(${currentTranslate}px)`;
}, { passive: true });

carouselTrack.addEventListener('touchend', e => {
  if (!isDragging) return;
  isDragging = false;

  const touchEndX = e.changedTouches[0].clientX;
  const deltaX = touchEndX - touchStartX;

  const swipeThreshold = 50;
  carouselTrack.style.transition = 'transform 0.3s ease';

  if (deltaX < -swipeThreshold && currentIndex < currentImages.length - 1) {
    currentIndex++;
  } else if (deltaX > swipeThreshold && currentIndex > 0) {
    currentIndex--;
  }

  updateCarouselPosition();
});




////////////////////////////////////////////////////////////////////////////////////////






// всплытие подсказок по аллергиям

const allergens = document.querySelectorAll('.allergen');

let activeTooltipEl = null;  // хранит элемент с открытой подсказкой
let activeHideTimer = null;

allergens.forEach(el => {
  let tooltip;
  let hideTimer;

  const showTooltip = () => {
    if (tooltip) return;

    // Закрыть подсказку у предыдущего активного элемента, если он не этот
    if (activeTooltipEl && activeTooltipEl !== el) {
      activeTooltipEl.dispatchEvent(new CustomEvent('closeTooltip'));
    }

    tooltip = document.createElement('div');
    tooltip.className = 'tooltip-box';
    tooltip.textContent = el.dataset.tooltip;
    document.body.appendChild(tooltip);

    const rect = el.getBoundingClientRect();
    tooltip.style.top = `${rect.top + window.scrollY - tooltip.offsetHeight - 6}px`;
    tooltip.style.left = `${rect.left + window.scrollX + rect.width / 2}px`;
    tooltip.style.transform = 'translateX(-50%)';
    tooltip.style.opacity = '1';

    el.classList.add('tooltip-visible'); //

    activeTooltipEl = el;
    clearTimeout(activeHideTimer);

    if (isTouchDevice()) {
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        hideTooltip();
        activeTooltipEl = null;
      }, 3000);
      activeHideTimer = hideTimer;
    }

    setTimeout(() => {
      document.addEventListener('pointerdown', onDocumentClick);
    }, 0);
  };

  const hideTooltip = () => {
    if (tooltip) {
      tooltip.remove();
      tooltip = null;
      el.classList.remove('tooltip-visible');
      clearTimeout(hideTimer);
      document.removeEventListener('pointerdown', onDocumentClick);

      if (activeTooltipEl === el) {
        activeTooltipEl = null;
        clearTimeout(activeHideTimer);
        activeHideTimer = null;
      }
    }
  };

  const toggleTooltip = (e) => {
    e.stopPropagation();
    if (tooltip) {
      if (!el.contains(e.target)) {
        hideTooltip();
      }
    } else {
      showTooltip();
    }
  };

  const onDocumentClick = (e) => {
    if (!el.contains(e.target)) {
      hideTooltip();
    }
  };

  // Слушаем кастомное событие для закрытия подсказки
  el.addEventListener('closeTooltip', () => {
    hideTooltip();
  });

  const isTouchDevice = () =>
    'ontouchstart' in window || navigator.maxTouchPoints > 0;

  el.addEventListener('mouseenter', showTooltip);
  el.addEventListener('mouseleave', hideTooltip);
  el.addEventListener('pointerdown', toggleTooltip);
});





// навигация по категориям


document.addEventListener("DOMContentLoaded", () => {

  if (window.scrollY > 0) {

    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 10);
  }


  const activePanel = document.querySelector('.nav-subcategories.active');
  if (activePanel) {
    activePanel.querySelectorAll('.subcategory-btn').forEach(btn => {
      btn.classList.add('show');
    });
  }

  let isAutoScrolling = false;
  //


  let waitingForFirstUserScroll = false;
  let lastScrollY = window.scrollY;


  let lastScrollTop = window.scrollY;
  let scrollDirection = "down";
  let lastActiveSubcategoryId = null;


  const categoryButtons = document.querySelectorAll(".category-btn");
  const subcategoryPanels = document.querySelectorAll(".nav-subcategories");
  const categorySections = document.querySelectorAll('.category-section');
  const subcategorySections = document.querySelectorAll('.subcategory-section');

  // Функция для скролла с учётом высоты навигации
  const scrollWithOffset = (id) => {
    const el = document.getElementById(id);
    if (!el) return;

    isAutoScrolling = true; //
    readyToObserve = false;


    const wasAtPageBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 2;



    const offset = el.getBoundingClientRect().top + window.scrollY - document.querySelector(".navigation-container").offsetHeight;
    window.scrollTo({ top: offset, behavior: "smooth" });
    // Отслеживаем достижение нужной позиции
    const checkIfReached = () => {
      const currentOffset = el.getBoundingClientRect().top - document.querySelector(".navigation-container").offsetHeight;

      //////
      const scrolledToBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 2;//
      const reachedTarget = Math.abs(currentOffset) < 2 || (!wasAtPageBottom && scrolledToBottom);
      ////////


      if (reachedTarget) {
        isAutoScrolling = false;
        //////
        waitingForFirstUserScroll = true;
        lastScrollY = window.scrollY;
        //////
      } else {
        requestAnimationFrame(checkIfReached);
      }
    };

    requestAnimationFrame(checkIfReached);
  };

  const showSubcategoryPanel = (categoryId) => {

    const subWrapper = document.querySelector('.nav-subcategories-wrapper');

    const newPanel = document.querySelector(`.nav-subcategories[data-category="${categoryId}"]`);
    const activePanel = document.querySelector('.nav-subcategories.active');

    if (activePanel === newPanel) return;

    if (activePanel) {
      activePanel.classList.remove('active');
      activePanel.querySelectorAll('.subcategory-btn').forEach(btn => {
        btn.classList.remove('show');
      });
    }


    // 
    if (!newPanel || newPanel.children.length === 0) {

      subWrapper.classList.add('hidden');

      return;
    } else {
      if (subWrapper.classList.contains('hidden')) {
        subWrapper.classList.remove('hidden');
      }
    }
    // 


    // Показываем новую панель
    newPanel.classList.add('active');

    // Сброс анимации у всех кнопок
    newPanel.querySelectorAll('.subcategory-btn').forEach(btn => {
      btn.classList.remove('show');
    });

    // Добавим класс с небольшой задержкой, чтобы сработала анимация
    setTimeout(() => {
      newPanel.querySelectorAll('.subcategory-btn').forEach(btn => {
        btn.classList.add('show');
      });
    }, 10);
  };
  // Активация нужной кнопки
  const activateButton = (buttons, id) => {
    buttons.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.target === id);
    });
  };


  categoryButtons.forEach(btn => {
    btn.addEventListener("click", () => {


      categoryButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const categoryId = btn.dataset.target;

      // Показать панель подкатегорий
      showSubcategoryPanel(categoryId);

      // Найти первую подкатегорию и подсветить (без прокрутки!)
      const panel = document.querySelector(`.nav-subcategories[data-category="${categoryId}"]`);
      const firstSubBtn = panel?.querySelector(".subcategory-btn");

      if (firstSubBtn) {
        panel.querySelectorAll(".subcategory-btn").forEach(b => b.classList.remove("active"));
        firstSubBtn.classList.add("active");
      }

      // Прокрутка к самой категории
      scrollWithOffset(categoryId);


    });
  });


  // Клики по подкатегориям
  document.querySelectorAll(".subcategory-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const panel = btn.closest(".nav-subcategories");
      panel.querySelectorAll(".subcategory-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      scrollWithOffset(btn.dataset.target);
    });
  });



  // Показать подкатегории по умолчанию
  const defaultCategory = document.querySelector(".category-btn.active")?.dataset.target || "starters";
  showSubcategoryPanel(defaultCategory);




  let ticking = false;

  const highlightClosestSubcategory = () => {
    if (isAutoScrolling) return;

    if (waitingForFirstUserScroll) return;




    const centerY = window.innerHeight / 2;
    let visibleSection = null;

    subcategorySections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= centerY && rect.bottom >= centerY) {
        visibleSection = section;
      }
    });

    const isNearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 5;
    if (!visibleSection && isNearBottom) {
      visibleSection = subcategorySections[subcategorySections.length - 1];
    }

    if (visibleSection && visibleSection.id !== lastActiveSubcategoryId) {
      lastActiveSubcategoryId = visibleSection.id;

      activateButton(document.querySelectorAll(".subcategory-btn"), visibleSection.id);

      const parentCategorySection = visibleSection.closest('.category-section');
      if (parentCategorySection) {
        const categoryId = parentCategorySection.id;
        activateButton(categoryButtons, categoryId);
        showSubcategoryPanel(categoryId);
      }
    }


  };



  window.addEventListener("scroll", () => {

    const currentScroll = window.scrollY;
    scrollDirection = currentScroll > lastScrollTop ? "down" : "up";
    lastScrollTop = currentScroll;

    if (waitingForFirstUserScroll && !isAutoScrolling) {
      const delta = Math.abs(window.scrollY - lastScrollY);
      if (delta > 10) {
        waitingForFirstUserScroll = false;
        // reobserveSubcategories(); // можно удалить позже
      }
    }

    if (!ticking) {
      window.requestAnimationFrame(() => {
        highlightClosestSubcategory();
        ticking = false;
      });
      ticking = true;
    }
  });

});




window.addEventListener("load", () => {
  const preloader = document.querySelector(".preloader");
  if (preloader) {
    setTimeout(() => {
      preloader.classList.add("hidden"); //hidden

    }, 800);

  }
});





