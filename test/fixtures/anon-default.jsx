// Non-TS file with an anonymous default export → triggers next's
// import/no-anonymous-default-export. (.jsx so `node --test` ignores it.)
export default () => 'anon';
