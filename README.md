# @ts-core/frontend

Библиотека утилит и сервисов для frontend-разработки на TypeScript. Предоставляет готовые решения для управления ресурсами, темами оформления, локализацией и состоянием загрузки.

[![npm version](https://badge.fury.io/js/@ts-core%2Ffrontend.svg)](https://www.npmjs.com/package/@ts-core/frontend)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

## Установка

```bash
npm install @ts-core/frontend
```

```bash
yarn add @ts-core/frontend
```

## Зависимости

| Пакет | Версия | Описание |
|-------|--------|----------|
| [@ts-core/common](https://github.com/ManhattanDoctor/ts-core-common) | ~3.0.60 | Базовые классы и утилиты |
| [@ts-core/language](https://github.com/ManhattanDoctor/ts-core-language) | ~3.0.38 | Работа с переводами |

## Возможности

- **Assets** — управление статическими ресурсами (иконки, изображения, видео, звуки)
- **ThemeService** — управление темами оформления с поддержкой CSS-классов
- **LanguageService** — мультиязычность и локализация
- **LoadingService** — отслеживание состояния загрузки
- **NativeWindowService** — работа с браузерным окном
- **CookieStorageUtil** — утилиты для работы с cookies

---

## API Reference

### Assets

Статический класс для получения URL ресурсов. Поддерживает различные типы ресурсов через провайдеры.

#### Инициализация

```typescript
import { Assets, AssetUrlProvider, AssetsCdnProvider } from '@ts-core/frontend';

// Простой провайдер
Assets.provider = new AssetUrlProvider('/assets/');

// Провайдер с CDN
Assets.provider = new AssetsCdnProvider(
  '/assets/',           // локальный URL
  'https://cdn.example.com/assets/',  // CDN URL
  ['image', 'video']    // директории для CDN (опционально)
);
```

#### Методы

| Метод | Параметры | Описание |
|-------|-----------|----------|
| `getIcon(name, extension?)` | name: string, extension: string = 'png' | Получить URL иконки |
| `getImage(name, extension?)` | name: string, extension: string = 'png' | Получить URL изображения |
| `getBackground(name, extension?)` | name: string, extension: string = 'png' | Получить URL фона |
| `getVideo(name, extension?)` | name: string, extension: string = 'mp4' | Получить URL видео |
| `getSound(name, extension?)` | name: string, extension: string = 'mp3' | Получить URL звука |
| `getFile(name, extension)` | name: string, extension: string | Получить URL файла |

#### Примеры

```typescript
// Получение ресурсов
const logoUrl = Assets.getIcon('logo');           // /assets/icon/logo.png
const heroImage = Assets.getImage('hero', 'jpg'); // /assets/image/hero.jpg
const introVideo = Assets.getVideo('intro');      // /assets/video/intro.mp4
const clickSound = Assets.getSound('click');      // /assets/sound/click.mp3
const docFile = Assets.getFile('manual', 'pdf');  // /assets/file/manual.pdf
```

#### Кастомный провайдер

```typescript
import { IAssetsProvider } from '@ts-core/frontend';

class MyCustomProvider implements IAssetsProvider {
  getUrl(directory: string, name: string, extension: string): string {
    return `https://my-cdn.com/${directory}/${name}.${extension}?v=${Date.now()}`;
  }
}

Assets.provider = new MyCustomProvider();
```

---

### ThemeService

Сервис управления темами оформления. Автоматически добавляет CSS-классы на `<body>` и сохраняет выбор в cookies.

#### Инициализация

```typescript
import { ThemeService, Theme } from '@ts-core/frontend';
import { ICookieService } from '@ts-core/frontend';

// Без сохранения в cookies
const themeService = new ThemeService();

// С сохранением в cookies
const themeService = new ThemeService({
  name: 'app-theme',
  service: cookieService  // реализация ICookieService
});
```

#### Конфигурация тем

```typescript
const themes = [
  {
    name: 'light',
    isDark: false,
    styleName: 'theme-light',  // CSS-класс (опционально, по умолчанию: name + '-theme')
    styles: {
      primaryColor: '#007bff',
      backgroundColor: '#ffffff',
      textColor: '#333333',
      // Ссылки на другие стили
      headerBackground: '⇛primaryColor'  // будет использовать значение primaryColor
    }
  },
  {
    name: 'dark',
    isDark: true,
    styles: {
      primaryColor: '#0d6efd',
      backgroundColor: '#1a1a1a',
      textColor: '#ffffff'
    }
  }
];

themeService.initialize(themes);
themeService.loadIfExist('light');  // загрузить из cookies или использовать 'light'
```

#### Свойства и методы

| Член | Тип | Описание |
|------|-----|----------|
| `theme` | Theme | Текущая тема (get/set) |
| `themes` | MapCollection\<Theme\> | Коллекция доступных тем |
| `events` | Observable\<string\> | Поток событий |
| `changed` | Observable\<string\> | Событие изменения темы |
| `initialize(themes)` | void | Инициализация списком тем |
| `loadIfExist(default?)` | void | Загрузить сохранённую тему |
| `getStyle<T>(name)` | T | Получить значение стиля |
| `destroy()` | void | Очистить ресурсы |

#### Примеры

```typescript
// Смена темы
themeService.theme = themeService.themes.get('dark');

// Получение стиля
const primaryColor = themeService.getStyle<string>('primaryColor');
const config = themeService.getStyle<{size: number}>('buttonConfig');

// Подписка на изменения
themeService.changed.subscribe(() => {
  console.log('Тема изменена:', themeService.theme.name);
});

// Проверка тёмной темы
if (themeService.theme.isDark) {
  // применить специфичные стили
}
```

---

### LanguageService

Сервис локализации с асинхронной загрузкой переводов.

#### Инициализация

```typescript
import { LanguageService, ILanguageServiceOptions } from '@ts-core/frontend';
import { ILanguageLoader } from '@ts-core/language';

// Реализация загрузчика переводов
class HttpLanguageLoader implements ILanguageLoader {
  public translation: any;

  async load(locale: string): Promise<any> {
    const response = await fetch(`/i18n/${locale}.json`);
    this.translation = await response.json();
    return this.translation;
  }
}

const languageService = new LanguageService({
  name: 'app-locale',
  service: cookieService
});

languageService.loader = new HttpLanguageLoader();
languageService.loadIfExist('ru');  // загрузить из cookies или 'ru'
```

#### Свойства и методы

| Член | Тип | Описание |
|------|-----|----------|
| `locale` | string | Текущая локаль (get/set) |
| `loader` | ILanguageLoader | Загрузчик переводов |
| `translator` | ILanguageTranslator | Транслятор |
| `rawTranslation` | any | Сырые данные перевода |
| `translate(key, params?)` | string | Получить перевод |
| `compile(key, params?)` | string | Скомпилировать перевод |
| `isHasTranslation(key)` | boolean | Проверить наличие перевода |
| `loadIfExist(default?)` | void | Загрузить сохранённую локаль |

#### Файл перевода (ru.json)

```json
{
  "common": {
    "hello": "Привет",
    "welcome": "Добро пожаловать, {{name}}!",
    "items": "{{count}} элемент(ов)"
  },
  "errors": {
    "notFound": "Страница не найдена",
    "serverError": "Ошибка сервера"
  }
}
```

#### Примеры

```typescript
// Простой перевод
const hello = languageService.translate('common.hello');  // "Привет"

// Перевод с параметрами
const welcome = languageService.translate('common.welcome', { name: 'Иван' });
// "Добро пожаловать, Иван!"

// Смена языка
languageService.locale = 'en';  // автоматически загрузит en.json

// Подписка на загрузку
languageService.events.subscribe(event => {
  if (event.type === 'COMPLETE') {
    console.log('Язык загружен:', languageService.locale);
  }
});

// Проверка наличия перевода
if (languageService.isHasTranslation('errors.customError')) {
  // перевод существует
}
```

---

### LoadingService

Сервис отслеживания состояния загрузки с подсчётом активных операций.

#### Использование

```typescript
import { LoadingService } from '@ts-core/frontend';

const loadingService = new LoadingService();

// Начало загрузки
loadingService.start();

// Проверка состояния
console.log(loadingService.isLoading);  // true

// Завершение загрузки
loadingService.finish();

console.log(loadingService.isLoaded);   // true
```

#### Множественные операции

```typescript
// Можно вызывать start/finish несколько раз
loadingService.start();  // counter = 1, isLoading = true
loadingService.start();  // counter = 2, isLoading = true
loadingService.finish(); // counter = 1, isLoading = true
loadingService.finish(); // counter = 0, isLoaded = true
```

---

### LoadingServiceManager

Автоматическое управление состоянием загрузки для массива Loadable-объектов.

```typescript
import { LoadingService, LoadingServiceManager } from '@ts-core/frontend';

const loadingService = new LoadingService();
const manager = new LoadingServiceManager(loadingService);

// Добавить объекты для отслеживания
manager.add(languageService);
manager.add(dataService);

// Состояние loadingService будет автоматически обновляться
// на основе состояния добавленных объектов
```

---

### NativeWindowService

Сервис для работы с браузерным окном и DOM.

#### Инициализация

```typescript
import { NativeWindowService } from '@ts-core/frontend';

const windowService = new NativeWindowService();
```

#### Свойства и методы

| Член | Тип | Описание |
|------|-----|----------|
| `isFocused` | boolean | Окно в фокусе |
| `url` | string | Текущий URL |
| `title` | string | Заголовок документа (get/set) |
| `window` | Window | Объект window |
| `document` | Document | Объект document |
| `isLoaded` | boolean | DOM загружен |
| `open(url?, target?)` | void | Открыть URL |
| `focus()` | void | Установить фокус |
| `blur()` | void | Убрать фокус |
| `getParam(name)` | string | Получить URL-параметр |
| `getParams(source?)` | URLSearchParams | Получить все параметры |

#### Примеры

```typescript
// Работа с URL-параметрами
// URL: https://example.com?page=1&sort=name
const page = windowService.getParam('page');  // "1"
const params = windowService.getParams();
params.get('sort');  // "name"

// Управление заголовком
windowService.title = 'Новая страница - Мой сайт';

// Открытие ссылки
windowService.open('https://example.com', '_blank');

// Отслеживание фокуса
windowService.events.subscribe(event => {
  if (event.type === 'FOCUS_CHANGED') {
    console.log('Фокус:', windowService.isFocused);
  }
});

// Ожидание загрузки DOM
if (!windowService.isLoaded) {
  windowService.events.subscribe(event => {
    if (event.type === 'LOADED') {
      console.log('DOM готов');
    }
  });
}
```

---

### CookieStorageUtil

Утилита для работы с cookies через ICookieService.

```typescript
import { CookieStorageUtil, ICookieStorageOptions } from '@ts-core/frontend';

const options: ICookieStorageOptions = {
  name: 'my-setting',
  service: cookieService,
  options: {
    expires: 30,  // дней
    path: '/'
  }
};

// Сохранение строки
CookieStorageUtil.put(options, 'value');

// Получение строки
const value = CookieStorageUtil.get(options);

// Сохранение объекта
CookieStorageUtil.putObject(options, { key: 'value' });

// Получение объекта
const obj = CookieStorageUtil.getObject<{key: string}>(options);

// Проверка валидности опций
if (CookieStorageUtil.isValid(options)) {
  // опции корректны
}
```

---

### ScriptLoader

Динамическая загрузка внешних скриптов.

```typescript
import { ScriptLoader } from '@ts-core/frontend';

const loader = new ScriptLoader();

// Загрузка скрипта
await loader.load('https://example.com/script.js');

// Загрузка с кастомными атрибутами (через наследование)
class CustomScriptLoader extends ScriptLoader {
  protected createScript(src: string): HTMLScriptElement {
    const script = super.createScript(src);
    script.async = true;
    script.defer = true;
    return script;
  }
}
```

---

### DefaultLogger

Логгер по умолчанию для использования в сервисах.

```typescript
import { DefaultLogger } from '@ts-core/frontend';

const logger = new DefaultLogger();
logger.log('Информация');
logger.warn('Предупреждение');
logger.error('Ошибка');
```

---

## Типы и интерфейсы

### ICookieService

```typescript
interface ICookieService {
  get(name: string): string;
  getObject<T>(name: string): T;
  update(name: string, value: string, options?: ICookieOptions): void;
  updateObject<T>(name: string, value: T, options?: ICookieOptions): void;
}
```

### ICookieOptions

```typescript
interface ICookieOptions {
  expires?: number | Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}
```

### IAssetsProvider

```typescript
interface IAssetsProvider {
  getUrl(directory: string, name: string, extension: string): string;
}
```

---

## Структура проекта

```
src/
├── asset/                  # Управление ресурсами
│   ├── Assets.ts
│   └── provider/
│       ├── IAssetsProvider.ts
│       ├── AssetUrlProvider.ts
│       └── AssetsCdnProvider.ts
├── cookie/                 # Работа с cookies
│   ├── CookieStorageUtil.ts
│   ├── ICookieService.ts
│   ├── ICookieOptions.ts
│   └── ICookieStorageOptions.ts
├── language/               # Локализация
│   └── LanguageService.ts
├── theme/                  # Темы оформления
│   ├── Theme.ts
│   ├── ThemeService.ts
│   └── ThemeAssetService.ts
├── service/                # Вспомогательные сервисы
│   ├── LoadingService.ts
│   ├── LoadingServiceManager.ts
│   ├── NativeWindowService.ts
│   └── SettingsServiceBase.ts
├── lib/                    # Утилиты
│   └── ScriptLoader.ts
├── logger/                 # Логирование
│   └── DefaultLogger.ts
└── public-api.ts           # Экспорт API
```

---

## Сборка

```bash
# Сборка проекта
make build

# Очистка
make clean

# Публикация (patch версия)
make publish_patch

# Публикация (minor версия)
make publish_minor

# Публикация (major версия)
make publish_major
```

---

## Лицензия

ISC

## Автор

Renat Gubaev (renat.gubaev@gmail.com)

## Ссылки

- [GitHub](https://github.com/ManhattanDoctor/ts-core-frontend)
- [Issues](https://github.com/ManhattanDoctor/ts-core-frontend/issues)
- [npm](https://www.npmjs.com/package/@ts-core/frontend)
