import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-webpart-base';
//import { escape } from '@microsoft/sp-lodash-subset';

import styles from './HelloWorldWebPart.module.scss';
import * as strings from 'HelloWorldWebPartStrings';

export interface IHelloWorldWebPartProps {
  description: string;
  test: string;
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
  private monthNames: Array<string> = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  private yearsAndMonths: Array<any> = [];
  private totalNews: number = 0;
  private totalFeedLength: number = 0;
  private newsViewPageUrl: string = '';
  private pagedInfo: Array<any> = [];
  private currentPageIndex: number = 1;


  public render(): void {
    this.domElement.innerHTML = `
      <div class="${ styles.helloWorld }">
       <h1>${this.properties.description} + ${this.properties.test} + ${this.list}</h1>
      </div>`;
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
                PropertyPaneTextField('test', {
                  label: 'Test'
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
