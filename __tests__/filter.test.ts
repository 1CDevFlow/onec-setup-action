import * as filter from '../src/onegetjs/filter'

describe('filter.ts', () => {
  it('windows x86 full', async () => {
    let filters = filter.getFilters('win', 'x86', 'full')
    let result = filter.filter(fixtures, filters)
    console.dir(result)
    expect(result.length).toEqual(1)
  })

  it('x64/x86', async () => {
    let files = [
      {
        name: 'Технологическая платформа 1С:Предприятия (64-bit) для Windows',
        url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5cwindows64full_8_3_25_1286.rar'
      },
      {
        name: 'Технологическая платформа 1С:Предприятия для Windows',
        url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5cwindows_8_3_25_1286.rar'
      }
    ]
    let filters = filter.getFilters('win', 'x86', 'full')
    let result1 = filter.filter(files, filters)
    expect(result1.length).toEqual(1)

    filters = filter.getFilters('win', 'x64', 'full')
    let result2 = filter.filter(files, filters)
    expect(result2.length).toEqual(1)
    expect(result1[0]).not.toEqual(result2[0])
  })
  it('Linux (deb) 64 client', async () => {
    let filters = filter.getFilters('deb', 'x64', 'client')
    let result = filter.filter(fixtures, filters)
    console.dir(result)
  })
})

let fixtures = [
  {
    name: 'Технологическая платформа 8.3. Версия 8.3.25.1286. Список изменений и порядок обновления',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5c1cv8upd_8_3_25_1286.htm'
  },
  {
    name: 'Тонкий клиент 1С:Предприятие (64-bit) для Windows',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5csetuptc64_8_3_25_1286.rar'
  },
  {
    name: 'Сервер 1С:Предприятия (64-bit) для Windows + Тонкий клиент для Windows, Linux и MacOS для автоматического обновления клиентов через веб-сервер',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5cwindows64_with_all_clients_8_3_25_1286.rar'
  },
  {
    name: 'Сервер 1С:Предприятия (64-bit) для Windows + Тонкий клиент для Windows и MacOS для автоматического обновления клиентов через веб-сервер',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5cwindows64_with_clients_8_3_25_1286.rar'
  },
  {
    name: 'Технологическая платформа 1С:Предприятия (64-bit) для Windows + Тонкий клиент для Windows, Linux и MacOS для автоматического обновления клиентов через веб-сервер',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5cwindows64full_with_all_clients_8_3_25_1286.rar'
  },
  {
    name: 'Технологическая платформа 1С:Предприятия (64-bit) для Windows + Тонкий клиент для Windows и MacOS для автоматического обновления клиентов через веб-сервер',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5cwindows64full_with_clients_8_3_25_1286.rar'
  },
  {
    name: 'Технологическая платформа 1С:Предприятия (64-bit) для Windows',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5cwindows64full_8_3_25_1286.rar'
  },
  {
    name: 'Сервер 1С:Предприятия (64-bit) для Windows',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5cwindows64_8_3_25_1286.rar'
  },
  {
    name: 'Тонкий клиент 1С:Предприятия для Windows',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5csetuptc_8_3_25_1286.rar'
  },
  {
    name: 'Технологическая платформа 1С:Предприятия для Windows + Тонкий клиент для Windows, Linux и MacOS для автоматического обновления клиентов через веб-сервер',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5cwindows_with_all_clients_8_3_25_1286.rar'
  },
  {
    name: 'Технологическая платформа 1С:Предприятия для Windows + Тонкий клиент для Windows и MacOS для автоматического обновления клиентов через веб-сервер',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5cwindows_with_clients_8_3_25_1286.rar'
  },
  {
    name: 'Технологическая платформа 1С:Предприятия для Windows',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5cwindows_8_3_25_1286.rar'
  },
  {
    name: 'Технологическая платформа 1С:Предприятия (64-bit) для Linux + Тонкий клиент для Windows, Linux и MacOS для автоматического обновления клиентов через веб-сервер',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5cserver64_with_all_clients_8_3_25_1286.zip'
  },
  {
    name: 'Технологическая платформа 1С:Предприятия (64-bit) для Linux + Тонкий клиент для Windows и MacOS для автоматического обновления клиентов через веб-сервер',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5cserver64_with_clients_8_3_25_1286.zip'
  },
  {
    name: 'Технологическая платформа 1С:Предприятия (64-bit) для Linux',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5cserver64_8_3_25_1286.zip'
  },
  {
    name: 'Тонкий клиент 1С:Предприятия (64-bit) для DEB-based Linux-систем',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5cthin.client_8_3_25_1286.deb64.zip'
  },
  {
    name: 'Тонкий клиент 1С:Предприятия (64-bit) для Linux',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5cthin.client64_8_3_25_1286.zip'
  },
  {
    name: 'Тонкий клиент 1С:Предприятия (64-bit) для RPM-based Linux-систем',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5cthin.client_8_3_25_1286.rpm64.zip'
  },
  {
    name: 'Клиент 1С:Предприятия (64-bit) для DEB-based Linux-систем',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5cclient_8_3_25_1286.deb64.zip'
  },
  {
    name: 'Клиент 1С:Предприятия (64-bit) для RPM-based Linux-систем',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5cclient_8_3_25_1286.rpm64.zip'
  },
  {
    name: 'Сервер 1С:Предприятия (64-bit) для DEB-based Linux-систем',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5cdeb64_8_3_25_1286.zip'
  },
  {
    name: 'Сервер 1С:Предприятия (64-bit) для RPM-based Linux-систем',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5crpm64_8_3_25_1286.zip'
  },
  {
    name: 'Технологическая платформа 1С:Предприятия для Linux + Тонкий клиент для Windows, Linux и MacOS для автоматического обновления клиентов через веб-сервер',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5cserver32_with_all_clients_8_3_25_1286.zip'
  },
  {
    name: 'Технологическая платформа 1С:Предприятия для Linux + Тонкий клиент для Windows и MacOS для автоматического обновления клиентов через веб-сервер',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5cserver32_with_clients_8_3_25_1286.zip'
  },
  {
    name: 'Тонкий клиент 1С:Предприятия для DEB-based Linux-систем',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5cthin.client_8_3_25_1286.deb32.zip'
  },
  {
    name: 'Технологическая платформа 1С:Предприятия для Linux',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5cserver32_8_3_25_1286.zip'
  },
  {
    name: 'Тонкий клиент 1С:Предприятия для Linux',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5cthin.client32_8_3_25_1286.zip'
  },
  {
    name: 'Тонкий клиент 1С:Предприятия для RPM-based Linux-систем',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5cthin.client_8_3_25_1286.rpm32.zip'
  },
  {
    name: 'Клиент 1С:Предприятия для DEB-based Linux-систем',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5cclient_8_3_25_1286.deb32.zip'
  },
  {
    name: 'Клиент 1С:Предприятия для RPM-based Linux-систем',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5cclient_8_3_25_1286.rpm32.zip'
  },
  {
    name: 'Сервер 1С:Предприятия для DEB-based Linux-систем',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5cdeb_8_3_25_1286.zip'
  },
  {
    name: 'Сервер 1С:Предприятия для RPM-based Linux-систем',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5crpm_8_3_25_1286.zip'
  },
  {
    name: 'Cервер 1С:Предприятия (Эльбрус-8С) для RPM-based Linux-систем',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5cserver.e2k_8c.rpm_8.3.25.1286.zip'
  },
  {
    name: 'Клиент 1С:Предприятия (Эльбрус-8С) для RPM-based Linux-систем',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5cclient.e2k_8c.rpm_8.3.25.1286.zip'
  },
  {
    name: 'Тонкий клиент 1С:Предприятия (Эльбрус-8С) для RPM-based Linux-систем',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5cthin.client.e2k_8c.rpm_8.3.25.1286.zip'
  },
  {
    name: 'Cервер 1С:Предприятия (Эльбрус-8С) для DEB-based Linux-систем',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5cserver.e2k_8c.deb_8.3.25.1286.zip'
  },
  {
    name: 'Клиент 1С:Предприятия (Эльбрус-8С) для DEB-based Linux-систем',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5cclient.e2k_8c.deb_8.3.25.1286.zip'
  },
  {
    name: 'Тонкий клиент 1С:Предприятия (Эльбрус-8С) для DEB-based Linux-систем',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5cthin.client.e2k_8c.deb_8.3.25.1286.zip'
  },
  {
    name: 'Сервер 1С:Предприятия (64-bit ARM) для RPM-based Linux-систем',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5cserver.arm.rpm64_8.3.25.1286.zip'
  },
  {
    name: 'Клиент 1С:Предприятия (64-bit ARM) для RPM-based Linux-систем',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5cclient.arm.rpm64_8.3.25.1286.zip'
  },
  {
    name: 'Тонкий клиент 1С:Предприятия (64-bit ARM) для RPM-based Linux-систем',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5cthin.client.arm.rpm64_8.3.25.1286.zip'
  },
  {
    name: 'Сервер 1С:Предприятия (64-bit ARM) для DEB-based Linux-систем',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5cserver.arm.deb64_8.3.25.1286.zip'
  },
  {
    name: 'Клиент 1С:Предприятия (64-bit ARM) для DEB-based Linux-систем',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5cclient.arm.deb64_8.3.25.1286.zip'
  },
  {
    name: 'Тонкий клиент 1С:Предприятия (64-bit ARM) для DEB-based Linux-систем',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5cthin.client.arm.deb64_8.3.25.1286.zip'
  },
  {
    name: 'Тонкий клиент 1С:Предприятия для macOS',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5cmacos.thin.client_8_3_25_1286.dmg'
  },
  {
    name: 'Клиент 1С:Предприятия для macOS',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5cmacos.client_8_3_25_1286.dmg'
  },
  {
    name: 'Технология внешних компонент',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5caddin_8_3_25_1286.zip'
  },
  {
    name: 'Демонстрационная информационная база',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5cdemo.zip'
  },
  {
    name: 'Демонстрационная информационная база (файл DT)',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5cdemodt_8_3_25_1286.zip'
  },
  {
    name: 'Файл настройки сортировки для Oracle Database',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5cCollations.rar'
  },
  {
    name: 'Решение текущих проблем работы с различными СУБД и ОС',
    url: 'https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.25.1286&path=Platform%5c8_3_25_1286%5cErr_Other.htm'
  },
  {
    name: 'Проблемные ситуации и ошибки в версии 8.3.25.1286',
    url: 'https://bugboard.v8.1c.ru/version/plt8gen/000038905'
  }
]
