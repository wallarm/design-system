// Rspress sets import.meta.env.SSG_MD during the llms.txt markdown pass but ships no type for it.
interface ImportMetaEnv {
  readonly SSG_MD: boolean;
}
