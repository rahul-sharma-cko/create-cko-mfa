export type TemplateType = 'default';
export type TemplateMode = 'js' | 'ts';

export interface GetTemplateFileArgs {
  template: TemplateType;
  mode: TemplateMode;
  file: string;
}

export interface InstallTemplateArgs {
  appName: string;
  root: string;
  isOnline: boolean;

  template: TemplateType;
  mode: TemplateMode;
  eslint: boolean;
  srcDir: boolean;
  importAlias: string;
}
