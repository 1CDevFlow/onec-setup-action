#!/bin/bash

# Скрипт для подготовки тестовой среды
set -e

echo "🔧 Подготовка тестовой среды..."

# Очищаем и создаем необходимые директории
echo "🧹 Очистка старых файлов..."
rm -rf ./tmp/installer/*
rm -rf ./tmp/oneget/*
rm -rf ./tmp/__downloads__/*

# Создаем необходимые директории
mkdir -p ./tmp/installer
mkdir -p ./tmp/oneget/test
mkdir -p ./tmp/__downloads__

# Устанавливаем правильные права
chmod 755 ./tmp
chmod 755 ./tmp/installer
chmod 755 ./tmp/oneget
chmod 755 ./tmp/oneget/test
chmod 755 ./tmp/__downloads__

echo "✅ Тестовая среда подготовлена"
echo "📁 Созданные директории:"
echo "   - ./tmp/installer"
echo "   - ./tmp/oneget/test"
echo "   - ./tmp/__downloads__"
