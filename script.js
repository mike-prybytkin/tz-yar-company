const scrollEvent = document.querySelector('.scroll-event');
const scrollEventWrapper = document.querySelector('.scroll-event__wrapper');
const scrollEStop = document.querySelector('.scroll-event__stop');
const scrollElementsWrapper = document.querySelector(
  '.scroll-event__elements-wrapper'
);
const scrollElements = document.querySelectorAll('.scroll-event__element');
let returnObserverPoint = 0;
let isScrollEventWrapperInCenter = false;

const callbackWrapper = (entries, observer) => {
  entries.forEach(({ isIntersecting, intersectionRatio, target }) => {
    if (isIntersecting) {
      target.dataset.scrollWrapper = intersectionRatio;
      target.style.setProperty('--scroll-wrapper', `${intersectionRatio}`);
      if (intersectionRatio >= 0.98) {
        observer.unobserve(target);
        returnObserverPoint = window.scrollY;
        target.style.setProperty('--scroll-wrapper', '1');
        target.dataset.scrollWrapper = 1;
        isScrollEventWrapperInCenter = true;
      }
    }
  });
};

// const callbackElement = (entries, observer) => {
//   entries.forEach(({ isIntersecting, intersectionRatio, target }) => {
//     if (isIntersecting) {
//       const order = target.dataset.scrollOrder;
//       target.dataset.scrollElement = intersectionRatio;
//       target.style.setProperty(
//         `--scroll-order-${order}`,
//         `${intersectionRatio}`
//       );

//       if (intersectionRatio >= 0.97) {
//         target.dataset.scrollElement = 1;
//         target.style.setProperty(`--scroll-order-${order}`, '1');
//       }
//     }
//   });
// };

let thresholdSets = [];
for (let i = 0; i <= 1; i += 0.001) {
  thresholdSets.push(i);
}

let thresholdSetsElements = [];
for (let i = 0; i <= 1; i += 0.01) {
  thresholdSetsElements.push(i);
}

const optionsWrapper = {
  threshold: thresholdSets,
};
const observerWrapper = new IntersectionObserver(
  callbackWrapper,
  optionsWrapper
);

const optionsElements = {
  threshold: thresholdSetsElements,
  root: scrollElementsWrapper,
  rootMargin: '0px 0px -75px 0px',
};
// const observerElements = new IntersectionObserver(
//   callbackElement,
//   optionsElements
// );

observerWrapper.observe(scrollEventWrapper);
// scrollElements.forEach((element) => observerElements.observe(element));

// --- window

let highestPoint = scrollEventWrapper.offsetTop / 2;
scrollEvent.addEventListener(
  'wheel',
  (event) => {
    // Отменяем стандартное поведение прокрутки страницы
    event.preventDefault();

    const scrollAmount = 10;
    const currentPosition = window.scrollY;
    const delta = Math.sign(event.deltaY);
    scrollToWithSpeed(currentPosition + delta * scrollAmount);
    // window.scrollTo(0, currentPosition + delta * scrollAmount);

    // console.log(window.scrollY);
    if (window.scrollY <= scrollEventWrapper.offsetTop / 2) {
      scrollEventWrapper.style.transform = `translateY(-${window.scrollY}px)`;
    } else if (window.scrollY >= scrollEventWrapper.offsetTop / 2) {
      if (delta === 1) {
        scrollToWithSpeed(currentPosition);
      } else {
        scrollToWithSpeed(currentPosition - scrollAmount);
      }
      const currentDegree = getDegreeElementById(scrollElements[0]);

      scrollElements[0].style.transform = `rotate(${
        currentDegree + delta * 15
      }deg)`;

      if (currentDegree >= 75 && delta === 1) {
        scrollElements[0].style.transform = `rotate(90deg)`;
      }
      if (currentDegree <= 15 && delta === -1) {
        scrollElements[0].removeAttribute('style');
      }
    }

    if (window.scrollY < returnObserverPoint) {
      observerWrapper.observe(scrollEventWrapper);
    }
  },
  { passive: false }
);

function scrollToWithSpeed(to, duration = 500) {
  const start = window.scrollY;
  const change = to - start;
  const increment = 100; // Интервал времени между кадрами анимации (в миллисекундах)

  let currentTime = 0;

  function animateScroll() {
    currentTime += increment;
    const val = easeInOutQuad(currentTime, start, change, duration);
    window.scrollTo(0, val);
    if (currentTime < duration) {
      window.requestAnimationFrame(animateScroll);
    }
  }

  animateScroll();
}

// Функция для создания плавности в анимации
function easeInOutQuad(t, b, c, d) {
  t /= d / 2;
  if (t < 1) return (c / 2) * t * t + b;
  t--;
  return (-c / 2) * (t * (t - 2) - 1) + b;
}

// функция для определения угла наклона элемента
function getDegreeElementById(element) {
  var style = window.getComputedStyle(element, null);
  // получаем значение стилей
  var valueStyle = style.getPropertyValue('transform');
  // если стилей нет, то угол 0 градусов
  if (valueStyle == 'none') return 0;
  // разбираем полученное значение

  var values = valueStyle.split('(')[1];
  values = values.split(')')[0];
  values = values.split(',');
  // получаем синус и косинус
  var cos = values[0];
  var sin = values[1];
  // вычисляем угол
  var degree = Math.round(Math.asin(sin) * (180 / Math.PI));
  if (cos < 0) {
    const addDegree = 90 - Math.round(Math.asin(sin) * (180 / Math.PI));
    degree = 90 + addDegree;
  }
  if (degree < 0) {
    degree = 360 + degree;
  }
  return degree;
}
