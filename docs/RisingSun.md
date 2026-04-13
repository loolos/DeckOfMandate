# Deck of Mandate  
## Level Theme: Louis XIV (1661–1676) — The Rising Sun  
## Event & Card Conversion Table (English / 中文对照)

---

# Historical Background (France 1661–1676)

This level represents the early personal rule of Louis XIV after 1661.

In 1661, after the death of Cardinal Mazarin, Louis XIV began his personal rule and transformed France into the most ambitious monarchy in Europe. Refusing to appoint another chief minister, the young king centralized authority around the crown and made royal power the center of political life.

His government relied on capable ministers such as Jean-Baptiste Colbert, who reorganized finances, promoted manufacturing, expanded trade, and strengthened the navy. Roads, ports, and royal industries were developed to increase national wealth. At the same time, the monarchy expanded its bureaucracy and reduced the independence of regional elites.

Louis XIV also began shaping the court culture that would later define Versailles. Nobles were drawn into royal ceremony, competition for favor, and life at court, weakening their ability to challenge the crown.

Abroad, France sought greater influence through war and diplomacy. The War of Devolution (1667–1668) brought territorial gains, while growing military strength made neighboring powers increasingly cautious. By the early 1670s, conflict with the Dutch Republic expanded into a wider European struggle.

This was an age of rising glory, but also rising cost. France grew stronger, richer, and more centralized—yet the burden of war, court spending, and political rivalry was already building beneath the surface.

Themes:

- Centralization of royal power  
- Court politics and noble control  
- Colbert economic reforms  
- Expansion of army and state capacity  
- Growing resistance from elites and provinces  
- France rising into European dominance

---

# War of Devolution (1667–1668)

The War of Devolution was the first major foreign war launched by Louis XIV after taking personal control of France. Using inheritance claims through his wife Maria Theresa of Spain, Louis argued that parts of the Spanish Netherlands should pass to her rather than to the young Spanish king Charles II.

Behind the legal claim was a strategic goal: France wanted stronger northern borders and the wealthy fortified cities of the Spanish Netherlands. French armies, recently reorganized and strengthened, advanced quickly in 1667 and captured several important towns. In early 1668, France also invaded Franche-Comté with surprising speed.

France’s success alarmed other European powers. England, the Dutch Republic, and Sweden formed the Triple Alliance to prevent further French expansion. Facing diplomatic pressure, Louis XIV accepted the Treaty of Aix-la-Chapelle in 1668.

France kept several valuable frontier fortresses but returned Franche-Comté. Militarily, the war was a success for France. Politically, it marked the beginning of widespread European efforts to contain French power.

The conflict also deepened Louis XIV’s hostility toward the Dutch Republic, helping lead to the larger Franco-Dutch War in 1672.

# Event Table

| ID | 中文名 | English Name | 类型 | 有害 | 权重 | 解决方式 | 未处理后果 | 历史说明 |
|----|--------|--------------|------|------|------|----------|------------|----------|
| budgetStrain | 宫廷超支 | Court Overspending | 财政 | 是 | 3 | 支付 2 经费 | 财政 -1 | 凡尔赛扩建、宫廷礼仪、奢华开支持续增加国库压力 |
| publicUnrest | 巴黎骚动 | Paris Unrest | 社会 | 是 | 3 | 仅危机干预 | 合法性 -1 | 巴黎长期是政治敏感城市，物价上涨与流言容易引发动荡 |
| administrativeDelay | 官僚拖延 | Bureaucratic Delay | 行政 | 是 | 2 | 支付 1 经费 | 下一回合抽牌 -1 | 中央命令传达到地方常被拖延或消极执行 |
| tradeOpportunity | 殖民贸易机遇 | Colonial Trade Boom | 机会 | 否 | 2 | 支付 1 经费（可忽略） | 无；支付后财政 +1 | 科尔贝尔推动海外贸易、港口建设与商业特许公司发展 |
| politicalGridlock | 贵族阻挠 | Noble Resistance | 政治 | 是 | 2 | 支付 1 经费 | 获得状态：权力流失 3 回合 | 贵族与旧势力反对中央集权及新税制改革 |
| powerVacuum | 地方总督坐大 | Provincial Governor Ascendant | 危机 | 是 | 1 | 2 经费 或 危机干预 | 下一年升级为重大危机 | 地方势力若长期放任，可能削弱王权控制 |
| majorCrisis | 王权危机 | Royal Crisis | 危机 | 是 | 0 | 仅危机干预 | 合法性 -1，且下回合抽牌惩罚 | 中央失控、地方叛离、宫廷联盟形成的综合危机 |
| warOfDevolution | 遗产战争 | War of Devolution | 军事 / 脚本 | 否 | —（脚本日历注入，不在加权池） | 支付脚本军费（`levelContent`）；+权力；50% 几率财政 +1；**不可**用王室干预解决 | 无（年末不施加 harmful 惩罚链） | 1667–1668 西属尼德兰与弗朗什-孔泰战事；成功后触发多年「反法同盟」抽牌风险（见下表） |

**脚本行说明：** `warOfDevolution` 由 `levelContent.scriptedCalendarEvents` 在指定年份放入版面，**不参与** `rollableEventIds` 加权抽取。玩家用 **SCRIPTED_EVENT_ATTACK** 支付军费并结算奖励；发动攻击后会写入 `antiFrenchLeague`（见状态表），在 **Draw 阶段** 每年掷骰，可能本年少抽 1 张（仍至少 1 张）。

---

# Player Card Table

| ID | 中文名 | English Name | 经费消耗 | 效果 | 历史说明 |
|----|--------|--------------|----------|------|----------|
| funding | 王室征收 | Royal Levy | 0 | 本回合 +1 经费 | 额外征税、临时收费、加快征收等短期筹资方式 |
| crackdown | 王室干预 | Royal Intervention | 1 | 危机干预（解决有害事件） | 国王敕令、军队出动、警察行动、强制执行 |
| reform | 行政整编 | Administrative Reform | 2 | 权力 +1，立即抽 1 张 | 路易十四强化官僚体系、提高行政效率 |
| ceremony | 凡尔赛庆典 | Versailles Ceremony | 2 | 合法性 +1 | 宫廷仪式、庆典、王权展示提升威望 |
| development | 皇家工厂 | Royal Manufactories | 3 | 财政 +1 | 科尔贝尔扶植制造业、基础建设、国家经济增长 |

---

# Status Effect Table

| 中文名 | English Name | 效果 | 历史说明 |
|--------|--------------|------|----------|
| 权力流失 | Loss of Authority | 3 回合抽牌尝试 -1 | 政敌阻挠、地方抗命、贵族拖延导致施政受限 |
| 反法同盟压力 | Anti-French coalition | 在持续回合内：每年 **Draw** 开始时有配置的几率 **−1** 抽牌尝试（仍 **≥1**） | 遗产战争后英荷瑞等外交牵制（亚琛和约前后）；数值来自 `scriptedCalendarEvents[].antiCoalition` |

---

# Recommended Level Flavor Text

| 事件 | 文案示例 |
|------|----------|
| 宫廷超支 | 凡尔赛扩建与宫廷礼仪开支再度超出预算。 |
| 巴黎骚动 | 面包价格上涨，巴黎街头聚集的人群越来越多。 |
| 官僚拖延 | 地方官员迟迟未执行来自宫廷的新命令。 |
| 殖民贸易机遇 | 海外贸易航线恢复畅通，商人请求王室支持。 |
| 贵族阻挠 | 几位大贵族私下联合，反对新的征税方案。 |
| 地方总督坐大 | 某省总督开始绕过宫廷自行发布命令。 |
| 王权危机 | 各方势力质疑王室权威，局势迅速恶化。 |
| 遗产战争 | 宫廷决定在西属尼德兰与边境要塞上押下重注；胜利会巩固边防，也会让邻国更加警惕。 |

---

# Level Identity Summary

```text
Young Louis XIV has taken power.
France is rising.
But glory is expensive,
Paris is restless,
and nobles never truly surrender.