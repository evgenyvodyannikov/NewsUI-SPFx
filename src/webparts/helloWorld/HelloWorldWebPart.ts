//#region импорты
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart, IPropertyPaneConfiguration, IWebPartEvent, PropertyPaneTextField } from '@microsoft/sp-webpart-base';
import * as $ from 'jquery';
import { SPComponentLoader } from '@microsoft/sp-loader';
import styles from './HelloWorldWebPart.module.scss';
import * as strings from 'HelloWorldWebPartStrings';
//#endregion

//#region картинки и ресурсы
const logo: any = require('./assets/logo.png');
const like: any = require('./assets/like.png');
require('./assets/test.css');
//#endregion

export interface IHelloWorldWebPartProps {
  description: string;
  title: string;
}

export default class HelloWorldWebPart extends BaseClientSideWebPart<IHelloWorldWebPartProps> {
  private list: string = 'Новости';
  private categoriesList: string = 'Новости - Категории';
  private items: Array<Object> = [];
  private categories: Array<Object> = [];
  private container: string = '.newsblock-content__wrapper';
  private categoriesContainer: string = '.news-tags-group';
  private itemsContainer: string = '.container#news';
  private pageSize: number = 6;
  private showFirstNPages: number = 5;
  private activeCategory: string = '';
  private activeCategoryColor: string = '';
  private doHoverOut: boolean = false;
  private monthNames: Array<string> = [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь'
  ];
  private yearsAndMonths: Array<any> = [];
  private totalNews: number = 0;
  private totalFeedLength: number = 0;
  private newsViewPageUrl: string = '';
  private pagedInfo: Array<any> = [];
  private currentPageIndex: number = 1;

  protected onInit(): Promise<void> {
    SPComponentLoader.loadCss('https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css');
    return super.onInit();
  }

  public render(): void {
    this.domElement.innerHTML = `

    <h1 id="hhhh" name="sds" class="${styles.pageMainTitle}">${this.properties.title}</h1>
    <div class="container ${styles.containerCustom}">
        <div class="row">
            <div class="col">
                <div class="${styles.newsTabs}">
                    <div class="${styles.newsTabLeft}" style="border-bottom: 4px solid rgb(255, 72, 166);">
                        <a href="#" class="${styles.newsTabTitle}">Текущие</a>
                    </div>
                    <div class="${styles.newsTabRight}" style="border-bottom: 4px solid transparent;">
                        <a href="#" class="${styles.newsTabTitle}">Архив</a>
                    </div>
                    <div class="news-tabs-line"></div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col">
                <div class="${styles.newsControlGroups}">
                    <div class="${styles.newsTagsGroup}" style="display: flex;">
                        <a class="${styles.mainTagsItem} ${styles.mainTagsItemActive}" href="#">
                            <p class="${styles.newsTagsItemTitle}">Все</p>
                            <p class="${styles.newsTagsItemNumber}">115</p>
                        </a>
                        <a class="${styles.mainTagsItem}" href="#">
                            <p class="${styles.newsTagsItemTitle}">Компания</p>
                            <p class="${styles.newsTagsItemNumber}">20</p>
                        </a>
                        <a class="${styles.mainTagsItem}" href="#">
                            <p class="${styles.newsTagsItemTitle}">Сотрудники</p>
                            <p class="${styles.newsTagsItemNumber}">15</p>
                        </a>
                        <a class="${styles.mainTagsItem}" href="#">
                            <p class="${styles.newsTagsItemTitle}">Вакансии</p>
                            <p class="${styles.newsTagsItemNumber}">30</p>
                        </a>
                        <a class="${styles.mainTagsItem}" href="#">
                            <p class="${styles.newsTagsItemTitle}">Инвестиции</p>
                            <p class="${styles.newsTagsItemNumber}">40</p>
                        </a>
                        <a class="some">require test.css - 48px</a>
                    </div>
                    <div class="${styles.newsSettingsGroup}">
                        <div class="${styles.settingsField} subscription">
                            <input type="checkbox" id="subscribeToNews" name="subscribe" disabled>
                            <label for="subscribeToNews">Подписаться на новости</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col">
                <div class="${styles.newsArchiveHeader}" style="display: none;">
                    <div class="${styles.newsArchiveHeaderLeft}">
                        <p class="${styles.newsArchiveSelectTitle}">Месяц</p>
                        <select class="form-select form-select-lg mb-3 custom" aria-label=".form-select-lg example">
                        <option value="1" selected="">Сентябрь</option>
                        <option value="2">Октябрь</option>
                        <option value="3">Ноябрь</option>
                        </select>
                    </div>
                    <div class="${styles.newsArchiveHeaderRight}">
                        <a class="main-tags-item active" href="#">
                            <p class="${styles.newsTagsItemTitle}">2020</p>
                        </a>
                        <a class="${styles.mainTagsItem}" href="#">
                            <p class="${styles.newsTagsItemTitle}">2019</p>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="${styles.newsContent} large">
        <div class="container" id="news">
                <div class="row">
                <div class="col-4">
                    <div class="${styles.newsContentItem}">
                        <a href="#" class="${styles.newsBackgroundImageContainer}">
                            <img class="${styles.newsBackgroundImage}" src="${logo}">
                            <p class="${styles.newsContentItemCategory}">Компания</p>
                        </a>
                        <div class="${styles.newsContentItemInfo}">
                            <a class="${styles.newsContentItemTitle}" href="#">Groupe Beneteau ищет
                                в IFS свою новую опору ERP</a>
                            <p class="${styles.newsContentItemDesc}">Церемония пройдет в формате онлайн-экскурсии по Третьяковской галерее</p>
                        </div>
                        <div class="${styles.newsContentItemFooter}">
                            <div class="${styles.newsContentItemLikes}">
                                <div class="${styles.newsContentItemLikesIconContainer}">
                                    <img class="${styles.newsContentItemLikesIcon}" src="${like}">
                                </div>
                                <p class="${styles.newsContentItemLikesNumber}">184</p>
                            </div>
                            <div class="${styles.newsContentItemfooterRight}">
                                <p class="${styles.newsContentItemViews}">62 просмотра</p>
                                <div class="${styles.newsContentItemSeparator}"></div>
                                <p class="${styles.newsContentItemDate}">12.02.2020</p>
                            </div>
                        </div>
                    </div>
                </div>                           
            </div> 
        </div>
        <div class="container" id="pagination">
            <div class="row">
                <div class="col">
                    <div class="${styles.pagination}">
                        <a class="${styles.paginationPrev}" href="#"><img class="pagination-prev-arrow" src="">&lt; Предыдущая</a>
                        <a class="${styles.paginationItem}" href="#">1</a>
                        <a class="${styles.paginationItem} ${styles.paginationItemActive}" href="#">2</a>
                        <a class="${styles.paginationItem}" href="#">3</a>
                        <a class="${styles.paginationItem}" href="#">4</a>
                        <a class="${styles.paginationItem}" href="#"><img class="pagination-next-arrow" src="">Следующая &gt;</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="${styles.newsContentSmall}">
        <div class="${styles.newsContentActual}">
           <div class="${styles.newsContentItemSmall}">
                <a href="#" class="${styles.newsBackgroundImageContainer}">
                    <img class="${styles.newsBackgroundImage}" src="${logo}">
                    <p class="${styles.newsContentItemCategory}">Компания</p>
                </a>
                <div class="${styles.newsContentItemInfo}">
                    <a class="${styles.newsContentItemTitle}" href="#">Организации, инвестирующие в навыки, управленцев</a>
                    <p class="${styles.newsContentItemDesc}">Новое исследование института BearingPoint показывает, как компании могут максимально...</p>
                </div>
                <div class="${styles.newsContentItemFooter}">
                    <div class="${styles.newsContentItemLikes}">
                        <div class="${styles.newsContentItemLikesIconContainer}">
                            <img class="${styles.newsContentItemLikesIcon}" src="./img/thumbs-up-icon.svg">
                        </div>
                        <p class="${styles.newsContentItemLikesNumber}">184</p>
                    </div>
                    <div class="${styles.newsContentItemfooterRight}">
                        <p class="${styles.newsContentItemViews}">62 просмотра</p>
                        <div class="${styles.newsContentItemSeparator}"></div>
                        <p class="${styles.newsContentItemDate}">12.02.2020</p>
                    </div>
                </div>
            </div>                        
        </div>
        <div class="${styles.newsContentArchive}" >
           <div class="${styles.newsContentItemSmall}">
                <a href="#" class="${styles.newsBackgroundImageContainer}">
                    <img class="${styles.newsBackgroundImage}" src="./img/news-item3.png">
                    <p class="${styles.newsContentItemCategory}">Компания</p>
                </a>
                <div class="${styles.newsContentItemInfo}">
                    <a class="${styles.newsContentItemTitle}" href="#">Организации, инвестирующие в навыки, управленцев</a>
                    <p class="${styles.newsContentItemDesc}">Новое исследование института BearingPoint показывает, как компании могут максимально...</p>
                </div>
                <div class="${styles.newsContentItemFooter}">
                    <div class="${styles.newsContentItemLikes}">
                        <div class="${styles.newsContentItemLikesIconContainer}">
                            <img class="${styles.newsContentItemLikesIcon}" src="./img/thumbs-up-icon.svg">
                        </div>
                        <p class="${styles.newsContentItemLikesNumber}">184</p>
                    </div>
                    <div class="${styles.newsContentItemfooterRight}">
                        <p class="${styles.newsContentItemViews}">62 просмотра</p>
                        <div class="${styles.newsContentItemSeparator}"></div>
                        <p class="${styles.newsContentItemDate}">12.02.2020</p>
                    </div>
                </div>
            </div>                          
        </div>
        <div class="pagination small">
            <%--<a class="pagination-prev" href="#"><img class="pagination-prev-arrow" src="">&lt; Предыдущая</a>
            <a class="pagination-item" href="#">1</a>
            <a class="pagination-item active" href="#">2</a>
            <a class="pagination-item" href="#">3</a>
            <a class="pagination-item" href="#">4</a>
            <a class="pagination-next" href="#"><img class="pagination-next-arrow" src="">Следующая &gt;</a>--%>
        </div>
    </div>
    
    `;

    console.log(this.test());

}

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                }),
                PropertyPaneTextField('title', {
                  label: strings.Title
                })
              ]
            }
          ]
        }
      ]
    };
  }

  protected test(): number {
    return 1 + 1;
  }
}
