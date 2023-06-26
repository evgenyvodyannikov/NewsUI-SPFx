//#region импорты
import { Version } from "@microsoft/sp-core-library";
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  IWebPartEvent,
  PropertyPaneTextField,
} from "@microsoft/sp-webpart-base";
import * as $ from "jquery";
import { SPComponentLoader } from "@microsoft/sp-loader";
import styles from "./HelloWorldWebPart.module.scss";
import * as strings from "HelloWorldWebPartStrings";
import * as utils from '../../scripts/master.js';
//#endregion

//#region картинки и ресурсы
const logo: any = require("./assets/logo.png");
const like: any = require("./assets/like.png");
require("./assets/news.css");
//#endregion

export interface IHelloWorldWebPartProps {
  description: string;
  title: string;
}

export default class HelloWorldWebPart extends BaseClientSideWebPart<IHelloWorldWebPartProps> {
  private list: string = "Новости";
  private categoriesList: string = "Новости - Категории";
  private items: Array<Object> = [];
  private categories: Array<Object> = [];
  private container: string = ".newsblock-content__wrapper";
  private categoriesContainer: string = ".news-tags-group";
  private itemsContainer: string = ".container#news";
  private pageSize: number = 6;
  private showFirstNPages: number = 5;
  private activeCategory: string = "";
  private activeCategoryColor: string = "";
  private doHoverOut: boolean = false;
  private monthNames: Array<string> = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ];
  private yearsAndMonths: Array<any> = [];
  private totalNews: number = 0;
  private totalFeedLength: number = 0;
  private newsViewPageUrl: string = "";
  private pagedInfo: Array<any> = [];
  private currentPageIndex: number = 1;

  protected onInit(): Promise<void> {
    SPComponentLoader.loadCss("https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css");
    // можно загрузить из общей папки стилей
    SPComponentLoader.loadCss("./box/css/main.css");
    return super.onInit();
  }

  public render(): void {
    this.domElement.innerHTML = `
    
        <h1 class="page-main-title text ${styles.title}">Новости</h1>
        <div class="container custom">
        <div class="row">
            <div class="col">
            <div class="news-tabs">
                <div class="news-tab-left" style="border-bottom: 4px solid rgb(255, 72, 166)">
                <a href="#" class="news-tab-title">Текущие</a>
                </div>
                <div class="news-tab-right" style="border-bottom: 4px solid transparent">
                <a href="#" class="news-tab-title">Архив</a>
                </div>
                <div class="news-tabs-line"></div>
            </div>
            </div>
        </div>

        <div class="row">
            <div class="col">
            <div class="news-control-groups">
                <div class="news-tags-group" style="display: flex">
                <a class="main-tags-item active" href="#">
                    <p class="main-tags-item-title">Все</p>
                    <p class="main-tags-item-number">115</p>
                </a>

                <a class="main-tags-item" href="#">
                    <p class="main-tags-item-title">Компания</p>
                    <p class="main-tags-item-number">20</p>
                </a>

                <a class="main-tags-item" href="#">
                    <p class="main-tags-item-title">Сотрудники</p>
                    <p class="main-tags-item-number">15</p>
                </a>

                <a class="main-tags-item" href="#">
                    <p class="main-tags-item-title">Вакансии</p>
                    <p class="main-tags-item-number">30</p>
                </a>

                <a class="main-tags-item" href="#">
                    <p class="main-tags-item-title">Инвестиции</p>
                    <p class="main-tags-item-number">40</p>
                </a>
                </div>
                <div class="news-settings-group">
                <div class="settings-field subscription">
                    <input type="checkbox" id="subscribeToNews" name="subscribe" disabled />
                    <label for="subscribeToNews">Подписаться на новости</label>
                </div>
                </div>
            </div>
            </div>
        </div>
        <div class="row">
            <div class="col">
            <div class="news-archive-header" style="display: none">
                <div class="news-archive-header-left">
                <p class="news-archive-select-title">Месяц</p>
                <select class="form-select form-select-lg mb-3 custom" aria-label=".form-select-lg example">
                    <option value="1" selected="">Сентябрь</option>
                    <option value="2">Октябрь</option>
                    <option value="3">Ноябрь</option>
                </select>
                </div>
                <div class="news-archive-header-right">
                <a class="main-tags-item active" href="#">
                    <p class="main-tags-item-title">2020</p>
                </a>
                <a class="main-tags-item" href="#">
                    <p class="main-tags-item-title">2019</p>
                </a>
                </div>
            </div>
            </div>
        </div>
        </div>
        <div class="news-content large">
        <div class="container" id="news">
            <div class="row">
            <div class="col-4">
                <div class="news-content-item">
                <a href="#" class="news-background-image-container">
                    <img class="news-background-image" src="./img/news-item1.png" />
                    <p class="news-content-item-category">Компания</p>
                </a>
                <div class="news-content-item-info">
                    <a class="news-content-item-title" href="#">Groupe Beneteau ищет в IFS свою новую опору ERP</a>
                    <p class="news-content-item-desc">Церемония пройдет в формате онлайн-экскурсии по Третьяковской галерее</p>
                </div>
                <div class="news-content-item-footer">
                    <div class="news-content-item-likes">
                    <div class="news-content-item-likes-icon-container">
                        <img class="news-content-item-likes-icon" src="./img/thumbs-up-icon.svg" />
                    </div>
                    <p class="news-content-item-likes-number">184</p>
                    </div>
                    <div class="news-content-item-footer-right">
                    <p class="news-content-item-views">62 просмотра</p>
                    <div class="news-content-item-separator"></div>
                    <p class="news-content-item-date">12.02.2020</p>
                    </div>
                </div>
                </div>
            </div>
            </div>
        </div>
        <div class="container" id="pagination">
            <div class="row">
            <div class="col">
                <div class="pagination">
                <a class="pagination-prev" href="#"><img class="pagination-prev-arrow" src="" />&lt; Предыдущая</a>
                <a class="pagination-item" href="#">1</a>
                <a class="pagination-item active" href="#">2</a>
                <a class="pagination-item" href="#">3</a>
                <a class="pagination-item" href="#">4</a>
                <a class="pagination-next" href="#"><img class="pagination-next-arrow" src="" />Следующая &gt;</a>
                </div>
            </div>
            </div>
        </div>
        </div>
        <div class="news-content small">
        <div class="news-content-actual">
            <div class="news-content-item small">
            <a href="#" class="news-background-image-container">
                <img class="news-background-image" src="./img/news-item1.png" />
                <p class="news-content-item-category">Компания</p>
            </a>
            <div class="news-content-item-info">
                <a class="news-content-item-title" href="#">Организации, инвестирующие в навыки, управленцев</a>
                <p class="news-content-item-desc">
                Новое исследование института BearingPoint показывает, как компании могут максимально...
                </p>
            </div>
            <div class="news-content-item-footer">
                <div class="news-content-item-likes">
                <div class="news-content-item-likes-icon-container">
                    <img class="news-content-item-likes-icon" src="./img/thumbs-up-icon.svg" />
                </div>
                <p class="news-content-item-likes-number">184</p>
                </div>
                <div class="news-content-item-footer-right">
                <p class="news-content-item-views">62 просмотра</p>
                <div class="news-content-item-separator"></div>
                <p class="news-content-item-date">12.02.2020</p>
                </div>
            </div>
            </div>
        </div>
        <div class="news-content-archive">
            <div class="news-content-item small">
            <a href="#" class="news-background-image-container">
                <img class="news-background-image" src="./img/news-item3.png" />
                <p class="news-content-item-category">Компания</p>
            </a>
            <div class="news-content-item-info">
                <a class="news-content-item-title" href="#">Организации, инвестирующие в навыки, управленцев</a>
                <p class="news-content-item-desc">
                Новое исследование института BearingPoint показывает, как компании могут максимально...
                </p>
            </div>
            <div class="news-content-item-footer">
                <div class="news-content-item-likes">
                <div class="news-content-item-likes-icon-container">
                    <img class="news-content-item-likes-icon" src="./img/thumbs-up-icon.svg" />
                </div>
                <p class="news-content-item-likes-number">184</p>
                </div>
                <div class="news-content-item-footer-right">
                <p class="news-content-item-views">62 просмотра</p>
                <div class="news-content-item-separator"></div>
                <p class="news-content-item-date">12.02.2020</p>
                </div>
            </div>
            </div>
        </div>
        <div class="pagination small">
            <a class="pagination-prev" href="#"><img class="pagination-prev-arrow" src="" />&lt; Предыдущая</a>
            <a class="pagination-item" href="#">1</a>
            <a class="pagination-item active" href="#">2</a>
            <a class="pagination-item" href="#">3</a>
            <a class="pagination-item" href="#">4</a>
            <a class="pagination-next" href="#"><img class="pagination-next-arrow" src="" />Следующая &gt;</a>
        </div>
        </div>
    `;

    console.log(Date.now())
    this.renderCompleted()
  }

  protected renderCompleted(): void {
    super.renderCompleted();
    
    //SP.SOD.executeFunc("sp.js", "SP.ClientContext", executeNewsFeed);

    $(".news-tags-group").on("click", ".main-tags-item:not(.active)", function (ev) {
        var currentCategoryId = $(ev.target).closest(".main-tags-item").data("categoryid")

        HelloWorldWebPart.categoryChanged(currentCategoryId);
    });

    $(".news-category-sm-select").change(function () {
        console.log("changed", $(this));
        var currentCat: Number = $(this).val() as Number || 0;
        HelloWorldWebPart.categoryChanged(currentCat);
    });

    $(".archive-content-header").on("click", ".archive-content-year:not(.active)", function (ev) {
        var selectedYear = $(ev.target).text();
        $('.archive-content-year.active').removeClass('active');
        $(ev.target).addClass('active');
        //var newMonthsToRender = NewsFeed.yearsAndMonths.filter(function (el) { return el.key == selectedYear })[0].values;
        $('.archive-content-months-select option').remove();
        $('.archive-content-months-select').append('<option selected="selected" value="0" class="archive-content-month">Выберите месяц</option>');
        //newMonthsToRender.forEach(function (el, ind) {
        ///    $('.archive-content-months-select').append('<option value=' + el.NewsMonth + ' class="archive-content-month">' + NewsFeed.monthNames[el.NewsMonth - 1] + ' (' + el["NewsMonth.COUNT.group2"] + ')' + '</option>');
        //});
        //console.log(selectedYear, newMonthsToRender);
    });

    $("select.form-select.custom").change(function () {
        var selectedMonth: number = $(this).val() as number;
        if (selectedMonth > 0) {
            var selectedYear = $('.news-archive-header-right .main-tags-item.active .main-tags-item-title').text();
            //window.location = (decodeURI(window.location.pathname) + '?MonthValue=' + selectedMonth + '&YearValue=' + selectedYear) as Location;
        }
    });


    $("div.news-archive-show-more").on("click", function () {
        $('div.news-archive-show-more > img').toggleClass('lk-arrow-down')
        $('div.news-archive-show-more > img').toggleClass('lk-arrow-up')
        if ($("div.news-archive-show-more > img").hasClass("lk-arrow-down")) {
            $(".news-archive-container").css("max-height", "185px");
            $("div.news-archive-show-more > a").text("Показать больше");
        } else {
            $(".news-archive-container").css("max-height", "500px")
            $("div.news-archive-show-more > a").text("Свернуть");
        }
    });

    $("div.news-tab-left").on("click", function () {
        $("div.news-content-actual").css("display", "flex");
        $("div.news-content-archive").css("display", "none");
        $("div.news-tab-left").css("border-bottom", "solid 4px #FF48A6");
        $("div.news-tab-right").css("border-bottom", "solid 4px transparent");
        $("div.news-archive-header").css("display", "none");
        $("div.news-tags-group").css("display", "flex");
        window.location.href = utils.removeParams('MonthValue,YearValue,page,CategoryID');
    });

    $("div.news-tab-right").on("click", function () {
        //$("div.news-content-actual").css("display", "none");
        //$("div.news-content-archive").css("display", "flex");
        $("div.news-tab-right").css("border-bottom", "solid 4px #FF48A6");
        $("div.news-tab-left").css("border-bottom", "solid 4px transparent");
        $("div.news-archive-header").css("display", "flex");
        //$("div.news-tags-group").css("display", "none");
    });

    $(".pagination").on("click", ".pagination-next", function () {
        //NewsFeed.clean();
        //var nextUrl = NewsFeed.pagedInfo[NewsFeed.currentPageIndex].next;
        //NewsFeed.currentPageIndex++;

        //localStorage["NewsPrevUrlLink"] = localStorage["NewsNextUrlLink"];
        //localStorage["NewsPageIndex"] = Number(localStorage["NewsPageIndex"])+1;

        //NewsFeed.getFeed(nextUrl);
    });

    $(".pagination").on("click", ".pagination-prev", function () {
       // NewsFeed.clean();
        //var prevUrl = NewsFeed.pagedInfo[NewsFeed.currentPageIndex].prev;

       //NewsFeed.currentPageIndex--;

        //localStorage["NewsNextUrlLink"] = localStorage["NewsPrevUrlLink"];
        //localStorage["NewsPageIndex"] = Number(localStorage["NewsPageIndex"])-1;

        //NewsFeed.getFeed(prevUrl);
    });
  }

  static categoryChanged(catId: Number|String): void {
    if (catId == undefined || catId == 0 || catId == "Все") {
        let href = utils.removeParams('CategoryID');
        if (utils.getUrlParameter('page') != undefined) {
            href = utils.removeParams('page');
        }
        window.location.href = href;

    } else {
        let href = window.location;
        if (utils.getUrlParameter('page') != undefined) {
            href = Location.apply(utils.removeParams('page'));
        }
        href = Location.apply(utils.URL_add_parameter(href, 'CategoryID', catId));

        //window.location.href = href as String;
    }
}






  protected get isRenderAsync(): boolean {
    return true;
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription,
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField("description", {
                  label: strings.DescriptionFieldLabel,
                }),
                PropertyPaneTextField("title", {
                  label: strings.Title,
                }),
              ],
            },
          ],
        },
      ],
    };
  }

  protected test(): number {
    return 1 + 1;
  }
}
