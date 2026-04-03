const TIPS = [
  "优先使用稳定首页或工作台地址作为入口。",
  "名称尽量简洁，方便搜索和分组展示。",
  "描述里写清用途，可提升审核通过效率。",
];

export function CustomAppTips() {
  return (
    <aside className="flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff,#f8fafc)] p-5">
      <h3 className="text-[15px] font-bold text-slate-900">提交前建议</h3>
      <ul className="grid gap-2.5 text-[13px] leading-6 text-slate-600">
        {TIPS.map((tip) => (
          <li key={tip} className="flex gap-2">
            <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
            <span>{tip}</span>
          </li>
        ))}
      </ul>
      <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50 px-3.5 py-3 text-[12.5px] leading-5 text-emerald-700">
        保存后会立刻出现在你的应用列表里，可随时编辑或删除。
      </div>
    </aside>
  );
}
