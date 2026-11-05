# Mashup Studio (fase 2)

1. Crea una cuenta en https://replicate.com y añade saldo (unos pocos euros bastan para empezar).
2. En Replicate, ve a Account > API tokens y crea un token.
3. Sube esta carpeta a un repositorio nuevo de GitHub.
4. En https://netlify.com elige "Add new site > Import from Git" y selecciona ese repositorio.
5. En Site configuration > Environment variables crea REPLICATE_API_TOKEN con tu token.
6. Vuelve a desplegar. Abre la URL de Netlify y prueba con un MP3 de menos de 4 MB.

Si falla con un error de "version" o de campos de entrada, abre replicate.com/ryan5453/demucs,
pestaña API, copia el id de la versión y ponlo en la variable DEMUCS_VERSION.
