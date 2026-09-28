import type { PluginClientContext, PluginSurfaceProps } from "@getpaseo/plugin/client";
import { SessionHubView } from "./client/session-hub-view";

export default function contribute(client: PluginClientContext) {
  function HubSurface(props: PluginSurfaceProps) {
    return <SessionHubView {...props} />;
  }

  const removeSurface = client.addSurface("session-hub", HubSurface);

  const removeSidebarItem = client.addSidebarItem({
    id: "session-hub",
    title: "会话中心",
    icon: "Layers",
    surface: "session-hub",
  });

  const removeCommandItem = client.addCommandCenterItem({
    id: "open-session-hub",
    title: "打开会话中心",
    icon: "Layers",
    keywords: ["hub", "session", "agents", "spotlight", "会话中心", "全部会话", "会话"],
    context: "global",
    onSelect({ openSurface }) {
      openSurface("session-hub");
    },
  });

  return () => {
    removeCommandItem();
    removeSidebarItem();
    removeSurface();
  };
}
