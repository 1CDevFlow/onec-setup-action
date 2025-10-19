# GitHub Action для установки 1С:Предприятие и 1C:EDT

[![GitHub Super-Linter](https://github.com/1CDevFlow/onec-setup-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/1CDevFlow/onec-setup-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/1CDevFlow/onec-setup-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/1CDevFlow/onec-setup-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/1CDevFlow/onec-setup-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/1CDevFlow/onec-setup-action/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

## Описание

Этот GitHub Action автоматизирует установку продуктов 1С:Предприятие и 1C:EDT в
CI/CD пайплайнах. Action поддерживает кеширование для ускорения повторных
установок и работает на Windows и Linux.

## Возможности

- ✅ **Автоматическая загрузка** дистрибутивов с официального сайта
  releases.1c.ru
- ✅ **Поддержка платформ**: Windows (x64), Linux (x64), macOS
- ✅ **Кеширование**: установленных компонентов и дистрибутивов
- ✅ **Безопасность**: автоматическое маскирование секретов GitHub Actions
- ✅ **Валидация**: проверка входных параметров и целостности файлов
- ✅ **Обработка ошибок**: детальная диагностика проблем установки

## Требования

- Node.js 20.x или выше
- Учетные данные для доступа к releases.1c.ru
- Поддерживаемые ОС: Ubuntu, Windows Server, macOS (частично)

## Параметры

| Параметр       | Обязательный | Описание                                        | По умолчанию  |
| -------------- | ------------ | ----------------------------------------------- | ------------- |
| `type`         | ✅           | Тип устанавливаемого продукта: `edt` или `onec` | -             |
| `edt_version`  | ❌           | Версия 1C:EDT для установки                     | `2024.2.6`    |
| `onec_version` | ❌           | Версия 1С:Предприятие для установки             | `8.3.20.1549` |
| `cache`        | ❌           | Использовать кеш для установленных компонентов  | `true`        |
| `cache_distr`  | ❌           | Использовать кеш для дистрибутивов              | `false`       |

## Переменные окружения

| Переменная      | Обязательная | Описание                            |
| --------------- | ------------ | ----------------------------------- |
| `ONEC_USERNAME` | ✅           | Имя пользователя для releases.1c.ru |
| `ONEC_PASSWORD` | ✅           | Пароль для releases.1c.ru           |

## Примеры использования

### Установка 1С:Предприятие

```yml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Установка 1С:Предприятие
        uses: 1CDevFlow/onec-setup-action@main
        with:
          type: onec # Тип устанавливаемого приложения
          onec_version: ${{ inputs.v8_version }}
          cache: ${{runner.os == 'Windows'}}
        env:
          ONEC_USERNAME: ${{ secrets.ONEC_USERNAME }}
          ONEC_PASSWORD: ${{ secrets.ONEC_PASSWORD }}
```

### Установка 1C:EDT

```yml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Установка 1C:EDT
        uses: 1CDevFlow/onec-setup-action@main
        with:
          type: edt # Тип устанавливаемого приложения
          edt_version: ${{ inputs.edt_version }}
          cache: true
        env:
          ONEC_USERNAME: ${{ secrets.ONEC_USERNAME }}
          ONEC_PASSWORD: ${{ secrets.ONEC_PASSWORD }}
        timeout-minutes: 30
```

## Устранение неполадок

### Частые проблемы

**Ошибка аутентификации:**

```
Authentication failed. Please check ONEC_USERNAME and ONEC_PASSWORD.
```

- Убедитесь, что учетные данные корректны
- Проверьте, что переменные окружения установлены правильно

**Ошибка установки:**

```
The process '/usr/bin/sudo' failed with exit code 1
```

- На Linux runner'ах может потребоваться настройка sudo без пароля
- Используйте `runs-on: ubuntu-latest` для стандартных настроек

### Логирование

GitHub Actions автоматически маскирует секреты в логах, поэтому чувствительные
данные (пароли, токены) не отображаются в выводе.

### Производительность

- Используйте `cache: true` для ускорения повторных установок
- `cache_distr: true` кеширует дистрибутивы
- Первая установка может занять 10-30 минут в зависимости от размера
  дистрибутива
