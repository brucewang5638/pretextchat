!macro customInstall
  !ifdef UNINSTALLER_ICON
    ${if} ${FileExists} "$newStartMenuLink"
      Delete "$newStartMenuLink"
      CreateShortCut "$newStartMenuLink" "$appExe" "" "$INSTDIR\uninstallerIcon.ico" 0 "" "" "${APP_DESCRIPTION}"
      ClearErrors
      WinShell::SetLnkAUMI "$newStartMenuLink" "${APP_ID}"
    ${endIf}

    ${if} ${FileExists} "$newDesktopLink"
      Delete "$newDesktopLink"
      CreateShortCut "$newDesktopLink" "$appExe" "" "$INSTDIR\uninstallerIcon.ico" 0 "" "" "${APP_DESCRIPTION}"
      ClearErrors
      WinShell::SetLnkAUMI "$newDesktopLink" "${APP_ID}"
    ${endIf}
  !endif
!macroend
