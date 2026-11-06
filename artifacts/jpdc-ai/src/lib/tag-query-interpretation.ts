export interface TagQueryCondition {
  label: string;
  value: string;
}

export interface TagQueryInterpretation {
  summary: string;
  conditions: TagQueryCondition[];
}

export function interpretTagQuery(query: string): TagQueryInterpretation | null {
  const text = query.trim();
  if (!text) return null;

  const year = text.match(/(20\d{2})\s*년/)?.[1];
  const month = text.match(/(\d{1,2})\s*월/)?.[1];
  const productMatch = text.match(/제주\s*삼다수|삼다수/);
  const product = productMatch
    ? (productMatch[0].replace(/\s+/g, '').startsWith('제주') ? '제주삼다수' : '삼다수')
    : undefined;
  const capacityMatch = text.match(/(\d+(?:\.\d+)?)\s*(m\s*l|ml|리터|l|ℓ)/i);
  const capacity = capacityMatch
    ? `${capacityMatch[1]}${/^(?:m\s*l|ml)$/i.test(capacityMatch[2].replace(/\s+/g, '')) ? 'mL' : 'L'}`
    : undefined;
  const metric = /매출/.test(text)
    ? '매출액'
    : /판매|팔렸|팔린/.test(text)
      ? '판매량'
      : /출고/.test(text)
        ? '출고량'
        : /생산/.test(text)
          ? '생산량'
          : /수량/.test(text)
            ? '수량'
            : undefined;
  const palletBased = /팔(?:레|렛)트|파렛트|plt/i.test(text);
  const rankingRequested = /상위|하위|top\s*\d+|랭킹|순위|최다|최저/i.test(text);
  const rankingDirection = /하위|최저/i.test(text) ? '하위' : '상위';
  const rankingLimit = text.match(/(?:상위|하위|top)\s*(\d+)/i)?.[1];

  const period = year && month
    ? `${year}년 ${month}월`
    : year
      ? `${year}년 (월 미지정)`
      : month
        ? `${month}월 (연도 미지정)`
        : undefined;
  const conditions: TagQueryCondition[] = [];
  if (period) conditions.push({ label: '조회 기간', value: period });
  if (product) conditions.push({ label: '제품', value: product });
  if (capacity) conditions.push({ label: '용량', value: capacity });
  if (metric) conditions.push({ label: '지표', value: metric });
  if (palletBased) conditions.push({ label: '집계 기준', value: '팔레트 단위' });
  if (rankingRequested) {
    conditions.push({
      label: '결과 범위',
      value: rankingLimit ? `${rankingDirection} ${rankingLimit}개` : `${rankingDirection} 개수 미지정`,
    });
    conditions.push({
      label: '정렬 기준',
      value: `${metric ?? '요청 지표'} ${rankingDirection === '상위' ? '내림차순' : '오름차순'}`,
    });
  }

  if (conditions.length === 0) return null;

  const dataLabel = [period, product, capacity, metric].filter(Boolean).join(' ');
  const subject = dataLabel ? `${dataLabel} 데이터` : '요청한 통계 데이터';
  const actions: string[] = [];
  if (palletBased) actions.push('팔레트 단위로 집계');
  if (rankingRequested) {
    const rank = rankingLimit ? `${rankingDirection} ${rankingLimit}개` : `${rankingDirection} 항목`;
    actions.push(`${metric ?? '요청 지표'} 기준으로 정렬해 ${rank} 선별`);
  }
  const summary = actions.length > 0
    ? `${subject}를 ${actions.join('하고, ')}하도록 해석했습니다.`
    : `${subject}를 조회하도록 해석했습니다.`;

  return { summary, conditions };
}
