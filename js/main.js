'use strong';

$(function () {
    let owlPartner = $(".partner .partner__carousel");

    owlPartner.owlCarousel({
        loop: true,
        nav: true,
        dots: false,
        navText: ['<img src="/img/chevron.png" alt="Nav button">', '<img src="/img/chevron.png" alt="Nav button">'],
        autoplay: true,
        autoplayTimeout: 2000,
        autoplayHoverPause: true,
        responsive: {
            0: {
                items: 1
            },
            511: {
                items: 2
            },
            690: {
                items: 2
            },
            970: {
                items: 3
            },
            1330: {
                items: 5
            }
        }
    });

    owlPartner.on('mousewheel', '.owl-stage', function (e) {
        if (e.deltaY > 0) {
            owl.trigger('next.owl');
        } else {
            owl.trigger('prev.owl');
        }
        e.preventDefault();
    });

    $(".featured-job .featured-job__carousel").owlCarousel({
        loop: true,
        items: 3,
        nav: true,
        dots: false,
        navText: ['<img src="/img/chevron.png" alt="Nav button">', '<img src="/img/chevron.png" alt="Nav button">'],
        autoplay: true,
        autoplayTimeout: 2000,
        autoplayHoverPause: false,
        margin: 80,
        responsive: {
            0: {
                items: 1
            },
            1500: {
                items: 3
            },

        }
    });

    /*datapicker*/
    let datepickers = $(".datepicker, .periodpicker");
    if ( datepickers.length ) {
        datepickers.datepicker({
            dateFormat: 'y/mm/dd'
        });
    }
    let choose_week = $(".choose-week-from, .choose-week-to");
    if ( choose_week.length ) {
        choose_week.datepicker({
            dateFormat: 'y.mm.dd'
        });
    }

    /*timepicker*/
    let time_visit = $('.time-visit');
    if ( time_visit.length ) {
        time_visit.timepicker({
            timeFormat: 'HH:mm p',
            interval: 15,
            minTime: '00:00',
            maxTime: '23:45',
            /*defaultTime: '11',*/
            startTime: '00:15',
            dynamic: false,
            dropdown: true,
            scrollbar: true
        });
    }

    /*yearpicker*/
    let year_picker = $('.yearpicker, .choose-year');
    if ( year_picker.length ) {
        year_picker.datepicker({
            changeYear: true,
            showButtonPanel: true,
            dateFormat: 'yy',
            onClose: function (dateText, inst) {
                var year = $("#ui-datepicker-div .ui-datepicker-year :selected").val();
                $(this).datepicker('setDate', new Date(year, 1));
            }
        });
        year_picker.focus(function () {
            $(".ui-datepicker-calendar, .ui-datepicker-current, .ui-datepicker-title span").hide();
        });
    }
});

/*-------this is a function which change blocks place-------*/
(function () {
    let originalPositions = [];
    let daElements = document.querySelectorAll('[data-da]');
    let daElementsArray = [];
    let daMatchMedia = [];
    //Заполняем массивы
    if (daElements.length > 0) {
        let number = 0;
        for (let index = 0; index < daElements.length; index++) {
            const daElement = daElements[index];
            const daMove = daElement.getAttribute('data-da');
            if (daMove != '') {
                const daArray = daMove.split(',');
                const daPlace = daArray[1] ? daArray[1].trim() : 'last';
                const daBreakpoint = daArray[2] ? daArray[2].trim() : '767';
                const daType = daArray[3] === 'min' ? daArray[3].trim() : 'max';
                const daDestination = document.querySelector('.' + daArray[0].trim())
                if (daArray.length > 0 && daDestination) {
                    daElement.setAttribute('data-da-index', number);
                    //Заполняем массив первоначальных позиций
                    originalPositions[number] = {
                        "parent": daElement.parentNode,
                        "index": indexInParent(daElement)
                    };
                    //Заполняем массив элементов
                    daElementsArray[number] = {
                        "element": daElement,
                        "destination": document.querySelector('.' + daArray[0].trim()),
                        "place": daPlace,
                        "breakpoint": daBreakpoint,
                        "type": daType
                    };
                    number++;
                }
            }
        }
        dynamicAdaptSort(daElementsArray);

        //Создаем события в точке брейкпоинта
        for (let index = 0; index < daElementsArray.length; index++) {
            const el = daElementsArray[index];
            const daBreakpoint = el.breakpoint;
            const daType = el.type;

            daMatchMedia.push(window.matchMedia("(" + daType + "-width: " + daBreakpoint + "px)"));
            daMatchMedia[index].addListener(dynamicAdapt);
        }
    }

    //Основная функция
    function dynamicAdapt(e) {
        for (let index = 0; index < daElementsArray.length; index++) {
            const el = daElementsArray[index];
            const daElement = el.element;
            const daDestination = el.destination;
            const daPlace = el.place;
            const daBreakpoint = el.breakpoint;
            const daClassname = "_dynamic_adapt_" + daBreakpoint;

            if (daMatchMedia[index].matches) {
                //Перебрасываем элементы
                if (!daElement.classList.contains(daClassname)) {
                    let actualIndex = indexOfElements(daDestination)[daPlace];
                    if (daPlace === 'first') {
                        actualIndex = indexOfElements(daDestination)[0];
                    } else if (daPlace === 'last') {
                        actualIndex = indexOfElements(daDestination)[indexOfElements(daDestination).length];
                    }
                    daDestination.insertBefore(daElement, daDestination.children[actualIndex]);
                    daElement.classList.add(daClassname);
                }
            } else {
                //Возвращаем на место
                if (daElement.classList.contains(daClassname)) {
                    dynamicAdaptBack(daElement);
                    daElement.classList.remove(daClassname);
                }
            }
        }
        customAdapt();
    }

    //Вызов основной функции
    dynamicAdapt();

    //Функция возврата на место
    function dynamicAdaptBack(el) {
        const daIndex = el.getAttribute('data-da-index');
        const originalPlace = originalPositions[daIndex];
        const parentPlace = originalPlace['parent'];
        const indexPlace = originalPlace['index'];
        const actualIndex = indexOfElements(parentPlace, true)[indexPlace];
        parentPlace.insertBefore(el, parentPlace.children[actualIndex]);
    }

    //Функция получения индекса внутри родителя
    function indexInParent(el) {
        var children = Array.prototype.slice.call(el.parentNode.children);
        return children.indexOf(el);
    }

    //Функция получения массива индексов элементов внутри родителя
    function indexOfElements(parent, back) {
        const children = parent.children;
        const childrenArray = [];
        for (let i = 0; i < children.length; i++) {
            const childrenElement = children[i];
            if (back) {
                childrenArray.push(i);
            } else {
                //Исключая перенесенный элемент
                if (childrenElement.getAttribute('data-da') == null) {
                    childrenArray.push(i);
                }
            }
        }
        return childrenArray;
    }

    //Сортировка объекта
    function dynamicAdaptSort(arr) {
        arr.sort(function (a, b) {
            if (a.breakpoint > b.breakpoint) {
                return -1
            } else {
                return 1
            }
        });
        arr.sort(function (a, b) {
            if (a.place > b.place) {
                return 1
            } else {
                return -1
            }
        });
    }

    //Дополнительные сценарии адаптации
    function customAdapt() {
        //const viewport_width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    }

}());


document.addEventListener('scroll', () => {
    const scrollBtn = document.querySelector('.scrollUp');
    window.scrollY > 713 ? scrollBtn.classList.add('scrollUp__show') : scrollBtn.classList.remove('scrollUp__show');
    scrollHeader();
});

/*      функция вызывается при скролле экрана и создает анимацию шапки     */
/*      если экран уже 1240px - она не сработает        */
function scrollHeader () {
    const header = document.querySelector('.header'),
        content = document.querySelector('.content');

    if (window.innerWidth < 1241 ) {
        return;
    } else {
        if (scrollY) {
            header.classList.add('scroll__header');
            content.classList.add('scroll__content');
        }

        if (!scrollY) {
            header.classList.remove('scroll__header');
            content.classList.remove('scroll__content');
        }
    }
}

document.addEventListener('click', e => {
    const menuBurgerInner = document.querySelector('.menu-burger__inner');
    openMenu(e, menuBurgerInner);
    closeMenu(e, menuBurgerInner);
    scrollUp(e);
    activePlus(e);
    activeAccount(e);
});

function openMenu(e, elem) {
    const menuBurgerBtn = e.target.closest('.menu-burger__btn');

    if (!menuBurgerBtn) {
        return;
    }

    elem.classList.add('active__menu-burger');
}

function closeMenu(e, elem) {
    const menuBurgerClose = e.target.closest('.menu-burger__close');

    if (!menuBurgerClose) {
        return;
    }

    elem.classList.remove('active__menu-burger');
}

function scrollUp(e) {
    const scrollBtn = e.target.closest('.scrollUp');

    if (!scrollBtn) {
        return
    }

    window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
    });
}


const vacancyListTitle = document.querySelectorAll('.vacancy__list-title'),
    vacancyItem = document.querySelectorAll('.vacancy__item'),
    accountContentTitle = document.querySelectorAll('.apply-now_title-box .apply-now_title'),
    accountContentInfo = document.querySelectorAll('.hide__apply-now');

function activePlus(e) {
    let targetNum = [...vacancyListTitle].indexOf(e.target);
    let title = e.target;
    const plusBtn = e.target.classList.contains('active-passive');
    if (targetNum === -1) {
        //if (e.target.contains('active-passive')) {
        if (plusBtn) {
            title = e.target.closest('.vacancy__list-title');
            targetNum = [...vacancyListTitle].indexOf(title);
        } else {
            return;
        }
    }

    title.classList.toggle('vacancy__list-title_active');
    vacancyItem[targetNum].classList.toggle('vacancy__item-active');

}

function activeAccount(e) {
    const targetNumAccountContentTitle = [...accountContentTitle].indexOf(e.target);

    if (targetNumAccountContentTitle === -1) {
        return;
    }

    e.target.classList.toggle('apply-now_title-active');
    accountContentInfo[targetNumAccountContentTitle].classList.toggle('visible__apply-now');

}

window.addEventListener("resize", () => {

    screenWidthDetection()

});

function screenWidthDetection() {
    const menuBurgerInner = document.querySelector('.menu-burger__inner');
    const header = document.querySelector('.header'),
        content = document.querySelector('.content');

    if (window.matchMedia("(min-width: 1240px)").matches) {
        menuBurgerInner.classList.remove('active__menu-burger');
    }
}

/*-------------------------------------------*/