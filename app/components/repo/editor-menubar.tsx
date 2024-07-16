import { useMonacoStore } from "@/stores/monaco-store";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";

export function EditorMenubar() {
  const {
    editorOptions,
    setEditorOptions,
    toggleMinimap,
    increaseFontSize,
    decreaseFontSize,
  } = useMonacoStore();

  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Editor Options</MenubarTrigger>
        <MenubarContent>
          <MenubarSub>
            <MenubarSubTrigger>Themes</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem
                onClick={() => setEditorOptions({ theme: "vs-dark" })}
              >
                Dark Theme
              </MenubarItem>
              <MenubarItem
                onClick={() => setEditorOptions({ theme: "vs-light" })}
              >
                Light Theme
              </MenubarItem>
              <MenubarItem
                onClick={() => setEditorOptions({ theme: "hc-black" })}
              >
                High Contrast Black
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Font Size</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem onClick={increaseFontSize}>
                Increase Font Size
              </MenubarItem>
              <MenubarItem onClick={decreaseFontSize}>
                Decrease Font Size
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem onClick={() => setEditorOptions({ wordWrap: "on" })}>
            Enable Word Wrap
          </MenubarItem>
          <MenubarItem onClick={() => setEditorOptions({ wordWrap: "off" })}>
            Disable Word Wrap
          </MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Language</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem
                onClick={() => setEditorOptions({ language: "typescript" })}
              >
                TSX
              </MenubarItem>
              <MenubarItem
                onClick={() => setEditorOptions({ language: "javascript" })}
              >
                JSX
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem onClick={toggleMinimap}>
            {editorOptions.minimap.enabled ? "Disable" : "Enable"} Minimap
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
