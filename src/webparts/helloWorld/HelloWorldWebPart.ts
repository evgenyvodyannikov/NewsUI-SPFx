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
import * as utils from "../../scripts/master.js";
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
  list: string = "Новости";
  categoriesList: string = "Новости - Категории";
  items: Array<Object> = [];
  categories: Array<Object> = [];
  container: string = ".newsblock-content__wrapper";
  categoriesContainer: string = ".news-tags-group";
  itemsContainer: string = ".container#news";
  pageSize: number = 6;
  showFirstNPages: number = 5;
  activeCategory: Number | String = 0;
  activeCategoryColor: string = "";
  doHoverOut: boolean = false;
  monthNames: Array<string> = [
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
  yearsAndMonths: Array<any> = [];
  totalNews: number = 0;
  totalFeedLength: number = 0;
  newsViewPageUrl: string = "";
  pagedInfo: Array<any> = [];
  currentPageIndex: number = 1;
  year: number = 0;
  month: number = 0;
  pageId: Number = 0;
  protected tests: number = 0;

  protected onInit(): Promise<void> {
    SPComponentLoader.loadCss(
      "https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css"
    );
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
                    
                </select>
                </div>
                <div class="news-archive-header-right">
                
                </div>
            </div>
            </div>
        </div>
        </div>
        <div class="news-content large">
        <div class="container" id="news">

        </div>
        <div class="container" id="pagination">
            <div class="row">
            <div class="col">
                <div class="pagination">
                
                </div>
            </div>
            </div>
        </div>
        </div>
        <div class="news-content small">
        <div class="news-content-actual">
            
        </div>
        <div class="news-content-archive">
            
        </div>
        <div class="pagination small">
           
        </div>
        </div>
    `;

    this.renderCompleted();
  }

  protected renderCompleted(): void {
    super.renderCompleted();

    let current = this;

    $(".news-tags-group").on("click", ".main-tags-item:not(.active)", function (ev) {
        var currentCategoryId = $(ev.target)
          .closest(".main-tags-item")
          .data("categoryid");

        current.categoryChanged(currentCategoryId);
      }
    );

    $(".news-category-sm-select").change(function () {
      console.log("changed", $(this));
      var currentCat: Number = ($(this).val() as Number) || 0;
      current.categoryChanged(currentCat);
    });

    $(".archive-content-header").on(
      "click",
      ".archive-content-year:not(.active)",
      function (ev) {
        var selectedYear = $(ev.target).text();
        $(".archive-content-year.active").removeClass("active");
        $(ev.target).addClass("active");
        var newMonthsToRender = current.yearsAndMonths.filter(function (el) {
          return el.key == selectedYear;
        })[0].values;
        $(".archive-content-months-select option").remove();
        $(".archive-content-months-select").append(
          '<option selected="selected" value="0" class="archive-content-month">Выберите месяц</option>'
        );
        newMonthsToRender.forEach(function (el, ind) {
          $(".archive-content-months-select").append(
            "<option value=" +
              el.NewsMonth +
              ' class="archive-content-month">' +
              current.monthNames[el.NewsMonth - 1] +
              " (" +
              el["NewsMonth.COUNT.group2"] +
              ")" +
              "</option>"
          );
        });
        console.log(selectedYear, newMonthsToRender);
      }
    );

    $("select.form-select.custom").change(function () {
      var selectedMonth: number = $(this).val() as number;
      if (selectedMonth > 0) {
        var selectedYear = $(
          ".news-archive-header-right .main-tags-item.active .main-tags-item-title"
        ).text();
        window.location.href =
          decodeURI(window.location.pathname) +
          "?MonthValue=" +
          selectedMonth +
          "&YearValue=" +
          selectedYear;
      }
    });

    $("div.news-archive-show-more").on("click", function () {
      $("div.news-archive-show-more > img").toggleClass("lk-arrow-down");
      $("div.news-archive-show-more > img").toggleClass("lk-arrow-up");
      if ($("div.news-archive-show-more > img").hasClass("lk-arrow-down")) {
        $(".news-archive-container").css("max-height", "185px");
        $("div.news-archive-show-more > a").text("Показать больше");
      } else {
        $(".news-archive-container").css("max-height", "500px");
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
      window.location.href = utils.removeParams(
        "MonthValue,YearValue,page,CategoryID"
      );
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

    this.init();
  }

  protected getTotalCount(url): JQueryXHR {
    let current = this;

    var countUrl = url.replace('$top=' + current.pageSize, '$top=1000');
    console.log(countUrl)
    return $.ajax({
        url: countUrl,
        type: "GET",
        headers: { "accept": "application/json;odata=verbose" },
        success: function (data) {
          current.totalFeedLength = data.d.results.length;
          console.log(current.totalFeedLength)
        }
    });
  }

  protected renderPaging(showNext): any{
    let current = this;
    //var numberOfPages = Math.ceil(itemsCount / NewsFeed.pageSize);
    //var pageId = Number(GetUrlKeyValue("page", false));
    //if (pageId == 0) pageId = 1;
    var prevUrl = current.pagedInfo[current.currentPageIndex].prev;
    var prevUndefined = prevUrl == undefined || prevUrl == '' || prevUrl == null;
    //var pageIndex = Number(localStorage["NewsPageIndex"]);
    if (!prevUndefined && current.currentPageIndex > 1) {
        //$('.pagination').removeClass('hidden');
        $(".pagination").append("<a class='pagination-prev' href='#' >&lt; Предыдущая </a>");
    }
    var startrange = (current.currentPageIndex - 1) * current.pageSize + 1;
    var endrange = current.currentPageIndex * current.pageSize;
    if (endrange > current.totalFeedLength) endrange = current.totalFeedLength;
    $("<span class='pagination-item'>" + startrange + " - " + endrange + " из " + current.totalFeedLength + " </span>").appendTo(".pagination");
    if (showNext) {
        //$('.pagination').removeClass('hidden');                           
        $(".pagination").append("<a class='pagination-next' href='#'> Следующая &gt;</a>");
    }
  }

  protected getPictureUrl(objArticle): JQueryXHR {
    return $.ajax({
        url: "/_api/web/lists/getbytitle('Новости - Изображения')/items?$select*,File/ServerRelativeUrl&$expand=File&$filter=ID eq " + objArticle.NewsPictureId,
        type: "GET",
        headers: { "accept": "application/json;odata=verbose" },
        success: function (data) {
            objArticle.NewsPictureUrl = data.d.results[0].File.ServerRelativeUrl;
        },
        error: utils.logError
    });
  }


  protected categoryChanged(catId: Number | String): void {
    if (catId == undefined || catId == 0 || catId == "Все") {
      let href = utils.removeParams("CategoryID");
      if (utils.getUrlParameter("page") != undefined) {
        href = utils.removeParams("page");
      }
      window.location.href = href;
    } else {
      let href = window.location.href;
      if (utils.getUrlParameter("page") != undefined) {
        href = utils.removeParams("page");
      }
      href = utils.URL_add_parameter(href, "CategoryID", catId);

      window.location.href = href;
    }
  }

  protected renderCategories(): void {
    let current = this;

    if (current.categories.length > 0) {
      var isAllActive =
        current.activeCategory == undefined || current.activeCategory == 0;
      $(current.categoriesContainer).append(
        '<a data-categoryid="0" class="main-tags-item all ' +
          (isAllActive ? "active" : "") +
          '" href="#">' +
          '<p class="main-tags-item-title">Все</p>' +
          '<p class="main-tags-item-number"></p>' +
          "</a>"
      );

      //filter year month
      var queryFilter = "";
      if (current.year != 0 && current.month != 0) {
        var pubDateStart = new Date(current.year, current.month - 1, 1);
        var pubDateEnd = new Date(current.year, current.month, 1);
        pubDateEnd.setTime(pubDateEnd.getTime() - 1000);
        //pubDateEnd.setDate(pubDateEnd.getDate()-1);

        var strSDate = new Date(
          pubDateStart.getTime() - pubDateStart.getTimezoneOffset() * 60000
        ).toISOString();
        var strEDate = new Date(
          pubDateEnd.getTime() - pubDateEnd.getTimezoneOffset() * 60000
        ).toISOString();
        queryFilter =
          "NewsPublishDate ge '" +
          strSDate +
          "' and NewsPublishDate le '" +
          strEDate +
          "'";
      }

      $.ajax({
        url:
          "/_api/web/lists/getbytitle('" +
          current.list +
          "')/Items?$select=ID" +
          (queryFilter != "" ? "&$filter=" + queryFilter : ""),
        type: "GET",
        async: false,
        headers: { accept: "application/json;odata=verbose" },
        success: function (data) {
          $(".main-tags-item.all p.main-tags-item-number").text(
            data.d.results.length
          );
        },
      });

      var categoriesPromises = current.categories.map(function (el: {
        Id: string;
        html: string;
        Title: string;
      }) {
        return $.ajax({
          url:
            "/_api/web/lists/getbytitle('" +
            current.list +
            "')/Items?$filter=NewsCategory/Id eq " +
            el.Id +
            (queryFilter != "" ? " and " + queryFilter : ""),
          type: "GET",
          //async: false,
          headers: { accept: "application/json;odata=verbose" },
          success: function (data) {
            if (data.d.results.length > 0) {
              var isActive = current.activeCategory == el.Id;
              el.html =
                '<a data-categoryid="' +
                el.Id +
                '" class="main-tags-item ' +
                (isActive ? "active" : "") +
                '" ' +
                ' href="#">' +
                '<p class="main-tags-item-title">' +
                el.Title +
                "</p>" +
                '<p class="main-tags-item-number">' +
                data.d.results.length +
                "</p>" +
                "</a>";
              //.appendTo(NewsFeed.categoriesContainer);
            }
          },
          error: utils.logError,
        });
      });
      $.when.apply($, categoriesPromises).done(function () {
        var joinedHtml = current.categories
          .map(function (el: { html: String }) {
            return el.html;
          })
          .filter(function (el) {
            return el != undefined;
          })
          .join("");
        $(current.categoriesContainer).append(joinedHtml);
      });
    }
  }

  protected init(): void {
    let current = this;

    current.activeCategory = Number(utils.getUrlParameter("CategoryID"));
    current.year = Number(utils.getUrlParameter("YearValue")) || 0;
    current.month = Number(utils.getUrlParameter("MonthValue")) || 0;
    let pageId: Number = Number(utils.getUrlParameter("page"));
    current.pageId = pageId == 0 ? 1 : pageId;

    $.ajax({
      url:
        "/_api/web/lists/getbytitle('" +
        current.categoriesList +
        "')/Items?$select=ID,Title,NewsCategoryOrder&$orderby=NewsCategoryOrder",
      type: "GET",
      headers: { accept: "application/json;odata=verbose" },
      success: function (data) {
        if (data.d.results.length > 0) {
          console.log("NewsFeed categories", data.d.results);
          current.categories = data.d.results;
          current.categories.forEach(function (el: {
            NewsCategoryOrder: number;
          }) {
            if (el.NewsCategoryOrder == null) {
              el.NewsCategoryOrder = 1000;
            }
          });

          current.categories = current.categories.sort(function (
            a: { NewsCategoryOrder: number },
            b: { NewsCategoryOrder: number }
          ) {
            return a.NewsCategoryOrder - b.NewsCategoryOrder;
          });
          console.log(current.tests);
          current.renderCategories();

          current.loadFeed();
          current.loadFilter();
        }
      },
      error: utils.logError,
    });

    //Event handlers
    $(current.itemsContainer).on(
      "click",
      ".news-content-item-likes-icon-container",
      function () {
        //this.manageLike($(this).parent().data("articleid"));
      }
    );
  }

  protected loadFeed(): void {
    let current = this;

    var queryFilter = [];
    if (current.year != 0 && current.month != 0) {
      var pubDateStart = new Date(current.year, current.month - 1, 1);
      var pubDateEnd = new Date(current.year, current.month, 1);
      pubDateEnd.setTime(pubDateEnd.getTime() - 1000);
      //pubDateEnd.setDate(pubDateEnd.getDate()-1);
      //debugger;
      var strSDate = pubDateStart.toISOString();
      //var strSDate = new Date(pubDateStart.getTime() - (pubDateStart.getTimezoneOffset() * 60000)).toISOString();
      var strEDate = pubDateEnd.toISOString();
      //var strEDate = new Date(pubDateEnd.getTime() - (pubDateEnd.getTimezoneOffset() * 60000)).toISOString();
      //queryFilter = "ДатаНовости ge datetime'" + strSDate + "' and ДатаНовости le datetime'" + strEDate + "'";
      queryFilter.push(
        "NewsPublishDate ge datetime'" +
          strSDate +
          "' and NewsPublishDate le datetime'" +
          strEDate +
          "'"
      );
      console.log(pubDateStart, pubDateEnd, strSDate, strEDate);
    }
    if (current.activeCategory != "") {
      queryFilter.push("NewsCategoryId eq " + String(current.activeCategory));
    }

    var endpointUrl = "/_api/web/lists/getbytitle('Новости')/items";
    endpointUrl += "?$select=NewsCategory/Title,*&$expand=NewsCategory";
    endpointUrl += "&$orderby=NewsPublishDate desc";
    if (queryFilter.length > 0) {
      endpointUrl += "&$filter=" + queryFilter.join(" and ");
    }
    endpointUrl += "&$top=" + current.pageSize;
    /* if (NewsFeed.pageId > 1) {
                endpointUrl += '&$skip=' + NewsFeed.pageSize * (NewsFeed.pageId - 1);
            } */
    console.log(endpointUrl);
    current.getTotalCount(endpointUrl).done(function (res) {
      current.getFeed(endpointUrl);
    });
  }

  protected loadFilter(): void {

  }

  protected getFeed(url: string): void {
    let current = this;

    $.ajax({
      url: url,
      type: "GET",
      headers: { accept: "application/json;odata=verbose" },
      success: function (data) {
        if (data.d.results) {
          // TODO: handle the data
          console.log("NewsFeed", data.d.results);
          current.items = data.d.results;
          var promises = current.items.map(function (el) {
            return current.getPictureUrl(el);
            /* .done(function(res){
                      console.log("get url for", el.NewsPictureId, res);
                      el.NewsPictureUrl = res.d.results[0].File.ServerRelativeUrl;
                  }); */
          });
          $.when.apply($, promises).then(function () {
            current.renderFeed();

            if (data.d.__next != undefined) {
              current.pagedInfo[current.currentPageIndex] = {
                ...current.pagedInfo[current.currentPageIndex],
                next: data.d.__next,
              };
              current.pagedInfo[current.currentPageIndex + 1] = {
                ...current.pagedInfo[current.currentPageIndex + 1],
                prev: url,
              };

              //localStorage["NewsNextUrlLink"] = data.d.__next;
              current.renderPaging(true);
            } else {
              current.pagedInfo[current.currentPageIndex] = {
                ...current.pagedInfo[current.currentPageIndex],
                next: null,
              };

              //localStorage["NewsNextUrlLink"] = '';
              current.renderPaging(false);
            }
          });
        }
      },
      error: utils.logError,
    });
  }

  protected renderFeed(): void {



    let current = this; 


    console.log("RENDER ITEMS: ", current.items)

    if (current.items.length > 0) {
      var newsHtml = '<div class="row">';
      current.items.forEach(function (el: {NewsCategory: any, ID: any, NewsPictureUrl: any, Title: any, NewsDescription: string, NewsPublishDate: any}) {
        var categories = el.NewsCategory.results
          .map(
            (el2) =>
              '<p class="news-content-item-category">' + el2.Title + "</p>"
          )
          .join("");
        var postUrl = current.newsViewPageUrl + el.ID;
        var imageUrl = el.NewsPictureUrl; //? el.КартинкаНовости.Путь + '/' + el.КартинкаНовости.Имя : "/_catalogs/masterpage/box/img/news-big-image.png";
            console.log('render item: ', el);
        newsHtml +=
          '<div class="col-4">' +
          '<div class="news-content-item">' +
          '<a href="' +
          postUrl +
          '" class="news-background-image-container">' +
          '<img class="news-background-image" src="' +
          imageUrl +
          '">' +
          '<div class="news-content-categories">' +
          categories +
          "</div>" +
          //'<p class="news-content-item-category">' + category.Title + '</p>' +
          //'<div class="news-big-img-container" style="background-image:url(' + imageUrl + ');"></div>' +
          "</a>" +
          '<div class="news-content-item-info">' +
          '<a class="news-content-item-title" href="' +
          postUrl +
          '">' +
          el.Title +
          "</a>" +
          '<p class="news-content-item-desc">' +
          (el.NewsDescription || "") +
          "</p>" +
          "</div>" +
          '<div class="news-content-item-footer">' +
          '<div class="news-content-item-likes" data-articleid="' +
          el.ID +
          '">' +
          '<div class="news-content-item-likes-icon-container">' +
          '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="black" class="bi bi-hand-thumbs-up" viewBox="0 0 16 16">' +
          '<path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2.144 2.144 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a9.84 9.84 0 0 0-.443.05 9.365 9.365 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111L8.864.046zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a8.908 8.908 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.047.047.109.177.005.488a2.224 2.224 0 0 1-.505.805l-.353.353.353.354c.006.005.041.05.041.17a.866.866 0 0 1-.121.416c-.165.288-.503.56-1.066.56z"></path>' +
          "</svg>" +
          "</div>" +
          '<p class="news-content-item-likes-number"></p>' +
          "</div>" +
          '<div class="news-content-item-comments" data-articleid="' +
          el.ID +
          '">' +
          '<div class="news-content-item-comments-icon-container">' +
          '<img class="news-content-item-comments-icon" src="/_catalogs/masterpage/box/img/comms-icon.svg">' +
          "</div>" +
          '<p class="news-content-item-comments-number"></p>' +
          "</div>" +
          '<div class="news-content-item-footer-right">' +
          '<p class="news-content-item-views" data-articleid="' +
          el.ID +
          '"></p>' +
          '<div class="news-content-item-separator"></div>' +
          '<p class="news-content-item-date">' +
          current.formatDate(el.NewsPublishDate) +
          "</p>" +
          "</div>" +
          "</div>" +
          "</div>" +
          "</div>";
      });
      newsHtml += "</div>";

      console.log(newsHtml)

      $(newsHtml).appendTo(current.itemsContainer);

      console.log('aa', $(current.itemsContainer))

      current.items.forEach(function (el: {ID: any}) {
       //current.getLikesForArticle(el.ID);
        //current.getCommentsForArticle(el.ID);
        //current.getVisitsForArticle(el.ID);
      });

      //small
      current.items.forEach(function (el: {NewsCategory: any, ID: any, NewsPictureUrl: any, Title: any, NewsDescription: string, NewsPublishDate: any}) {
        var categories = el.NewsCategory.results
          .map(
            (el2) =>
              '<p class="news-content-item-category">' + el2.Title + "</p>"
          )
          .join("");
        var postUrl = current.newsViewPageUrl + el.ID;
        var imageUrl = el.NewsPictureUrl; // ? el.КартинкаНовости.Путь + '/' + el.КартинкаНовости.Имя : "/_catalogs/masterpage/box/img/news-big-image.png";

        $(".news-content.small .news-content-actual").append(
          '<div class="news-content-item small">' +
            '<a href="' +
            postUrl +
            '" class="news-background-image-container">' +
            '<img class="news-background-image" src="' +
            imageUrl +
            '">' +
            '<div class="news-content-categories">' +
            categories +
            "</div>" +
            //'<p class="news-content-item-category">' + category.Title + '</p>' +
            //'<div class="news-big-img-container" style="background-image:url(' + imageUrl + ');"></div>' +
            "</a>" +
            '<div class="news-content-item-info">' +
            '<a class="news-content-item-title" href="' +
            postUrl +
            '">' +
            el.Title +
            "</a>" +
            '<p class="news-content-item-desc">' +
            (el.NewsDescription || "") +
            "</p>" +
            "</div>" +
            '<div class="news-content-item-footer">' +
            '<div class="news-content-item-likes" data-articleid="' +
            el.ID +
            '">' +
            '<div class="news-content-item-likes-icon-container">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="black" class="bi bi-hand-thumbs-up" viewBox="0 0 16 16">' +
            '<path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2.144 2.144 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a9.84 9.84 0 0 0-.443.05 9.365 9.365 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111L8.864.046zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a8.908 8.908 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.047.047.109.177.005.488a2.224 2.224 0 0 1-.505.805l-.353.353.353.354c.006.005.041.05.041.17a.866.866 0 0 1-.121.416c-.165.288-.503.56-1.066.56z"></path>' +
            "</svg>" +
            "</div>" +
            '<p class="news-content-item-likes-number"></p>' +
            "</div>" +
            '<div class="news-content-item-comments" data-articleid="' +
            el.ID +
            '">' +
            '<div class="news-content-item-comments-icon-container">' +
            '<img class="news-content-item-comments-icon" src="/_catalogs/masterpage/box/img/comms-icon.svg">' +
            "</div>" +
            '<p class="news-content-item-comments-number"></p>' +
            "</div>" +
            '<div class="news-content-item-footer-right">' +
            '<p class="news-content-item-views" data-articleid="' +
            el.ID +
            '"></p>' +
            '<div class="news-content-item-separator"></div>' +
            '<p class="news-content-item-date">' +
            current.formatDate(el.NewsPublishDate) +
            "</p>" +
            "</div>" +
            "</div>" +
            "</div>"
        );
      });
    }
  }

  protected formatDate(date): String {
    let format = new Date(date)
    let month: number = format.getMonth() + 1;
    let formattedMonth = month < 10 ? '0' + month.toString() : month.toString();

    return `${format.getDate().toString()}.${formattedMonth}.${format.getFullYear()}`;
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
