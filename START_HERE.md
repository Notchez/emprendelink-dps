# START HERE — pasos del responsable que publica el repositorio

1. Descomprimir este esqueleto.
2. Abrir la carpeta en VS Code.
3. Verificar Node:

```bash
node -v
```

Debe mostrar `v24.21.0` si se usa exactamente la versión acordada.

4. Instalar:

```bash
npm install
```

Esto generará `package-lock.json`.

5. Probar:

```bash
npm run check
npm run dev
```

6. **Commit obligatorio:** incluir `package-lock.json` para que todos usen el mismo árbol de
   dependencias.

7. Inicializar Git si la carpeta todavía no es repo:

```bash
git init
git branch -M main
git add .
git commit -m "chore(project): initialize EmprendeLink stage 2 skeleton"
```

8. Crear el repositorio remoto vacío en GitHub y enlazarlo:

```bash
git remote add origin <URL_DEL_REPOSITORIO>
git push -u origin main
```

9. Crear `develop`:

```bash
git checkout -b develop
git push -u origin develop
```

10. En GitHub:

- agregar a los 5 integrantes como colaboradores;
- proteger `main`;
- requerir Pull Request para `main`;
- si es posible, proteger también `develop`.

11. Los compañeros clonan:

```bash
git clone <URL_DEL_REPOSITORIO>
cd emprendelink-dps
git checkout develop
npm install
```

12. Cada uno crea su rama desde `develop`.

No comenzar a programar módulos antes de que `package-lock.json`, `main` y `develop` hayan sido
subidos correctamente.
