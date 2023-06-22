declare interface IHelloWorldWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  DescriptionFieldLabel: string;
  Test: string;
}

declare module 'HelloWorldWebPartStrings' {
  const strings: IHelloWorldWebPartStrings;
  export = strings;
}
