# Действие GitHub Action для установки `1С:Предприятие` и `1C:EDT`

[![GitHub Super-Linter](https://github.com/1CDevFlow/onec-setup-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/1CDevFlow/onec-setup-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/1CDevFlow/onec-setup-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/1CDevFlow/onec-setup-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/1CDevFlow/onec-setup-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/1CDevFlow/onec-setup-action/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

## Использование

Действие позволяет устанавливать 1С:Предприятие и 1C:EDT для использования в ваших рабочих процессах (workflows).

Позволяет:

* Скачивание дистрибутивов с `https://releases.1c.ru`, необходимо указать учетные данные
* Установка в Windows и Linux
* Кеширование скаченных дистрибутивов
* Кеширование инсталляции

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

## Contributing

After you've cloned the repository to your local machine or codespace, you'll
need to perform some initial setup steps before you can develop your action.

> [!NOTE]
>
> You'll need to have a reasonably modern version of
> [Node.js](https://nodejs.org) handy (20.x or later should work!). If you are
> using a version manager like [`nodenv`](https://github.com/nodenv/nodenv) or
> [`nvm`](https://github.com/nvm-sh/nvm), this template has a `.node-version`
> file at the root of the repository that will be used to automatically switch
> to the correct version when you `cd` into the repository. Additionally, this
> `.node-version` file is used by GitHub Actions in any `actions/setup-node`
> actions.

1. :hammer_and_wrench: Install the dependencies

   ```bash
   npm install
   ```

1. :building_construction: Package the TypeScript for distribution

   ```bash
   npm run bundle
   ```

1. :white_check_mark: Run the tests

   ```bash
   $ npm test

   PASS  ./index.test.js
     ✓ throws invalid number (3ms)
     ✓ wait 500 ms (504ms)
     ✓ test runs (95ms)

   ...
   ```

## Validate the Action

You can now validate the action by referencing it in a workflow file. For
example, [`ci.yml`](./.github/workflows/ci.yml) demonstrates how to reference an
action in the same repository.

```yaml
steps:
  - name: Checkout
    id: checkout
    uses: actions/checkout@v4

  - name: Test Local Action
    id: test-action
    uses: ./
    with:
      milliseconds: 1000

  - name: Print Output
    id: output
    run: echo "${{ steps.test-action.outputs.time }}"
```

For example workflow runs, check out the
[Actions tab](https://github.com/1CDevFlow/onec-setup-action/actions)! :rocket:
