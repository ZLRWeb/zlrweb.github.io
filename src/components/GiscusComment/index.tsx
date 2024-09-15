import Giscus from '@giscus/react';
import { useColorMode } from '@docusaurus/theme-common';

export default function GiscusComment() {
  const { colorMode } = useColorMode();

  return (
    <Giscus
      repo="ZLRWeb/zlrweb.github.io"
      repoId="R_kgDOIVsQvQ"
      category="Announcements"
      categoryId="DIC_kwDOIVsQvc4CiYfx"
      mapping="title"
      strict="0"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme={colorMode}
      lang="zh-TW"
      loading="lazy"
      //   crossorigin="anonymous"
      //   async
    />
  );
}
