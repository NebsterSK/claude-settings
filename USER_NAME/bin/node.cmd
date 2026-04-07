@echo off
for /f "delims=" %%d in ('dir /b /ad /o-d "%USERPROFILE%\.config\herd\bin\nvm\v*"') do (
    "%USERPROFILE%\.config\herd\bin\nvm\%%d\node.exe" %*
    exit /b
)
