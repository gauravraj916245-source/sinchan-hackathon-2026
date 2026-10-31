import { OutdatedStatus, OutdatedWarning, SourceItem } from '../types.js';

export function detectOutdatedInformation(sources: SourceItem[]): OutdatedWarning[] {
  const currentYear = 2026; // Current year context as provided in metadata (2026)
  const warnings: OutdatedWarning[] = [];

  for (const source of sources) {
    let status: OutdatedStatus = 'date_unavailable';
    let explanation = '';
    let recommendation = '';
    let detectedTag: string | null = null;

    // Check publication date or cycle
    const combined = (source.title + ' ' + (source.publishedDate || '') + ' ' + (source.cycleInfo || '') + ' ' + source.content.slice(0, 500)).toLowerCase();

    // Look for year patterns (e.g., 2023, 2024, 2025, 2026, 2027)
    const yearsFound = combined.match(/\b(201\d|202[0-9])\b/g);
    const cycleFound = source.cycleInfo || (combined.match(/\b(202[0-9][–\/-](?:20)?2[0-9])\b/) ? combined.match(/\b(202[0-9][–\/-](?:20)?2[0-9])\b/)![1] : null);

    if (cycleFound) {
      detectedTag = cycleFound;
      // If cycle is prior to 2026
      if (cycleFound.includes('2023') || cycleFound.includes('2024') || cycleFound.includes('2025')) {
        status = 'potentially_outdated';
        explanation = `Source explicitly references academic/application cycle "${cycleFound}", which precedes the current 2026–27 cycle. Rules, eligibility cutoffs, or deadlines may have revised.`;
        recommendation = 'Obtain the 2026–27 notification or press release to confirm if this procedure still holds.';
      } else {
        status = 'current';
        explanation = `Source references cycle "${cycleFound}", matching current operational timeframe.`;
        recommendation = 'Cross-verify with official gazette to catch mid-cycle addendums.';
      }
    } else if (source.publishedDate) {
      detectedTag = source.publishedDate;
      const pubYearMatch = source.publishedDate.match(/\b(20\d\d)\b/);
      if (pubYearMatch) {
        const pubYear = parseInt(pubYearMatch[1], 10);
        if (pubYear < currentYear - 1) {
          status = 'potentially_outdated';
          explanation = `Source was published in ${source.publishedDate} (more than a year old). Requirements may have changed.`;
          recommendation = 'Check the official portal for the latest circular published in the current cycle.';
        } else {
          status = 'current';
          explanation = `Source published recently (${source.publishedDate}). Note: Recent publication does not guarantee immunity from retroactive amendments.`;
          recommendation = 'Confirm whether any subsequent corrigendum has been issued.';
        }
      } else {
        status = 'undated';
        explanation = 'Date string could not be definitively converted to a calendar year.';
        recommendation = 'Check for timestamp in document header/footer or server response.';
      }
    } else if (yearsFound && yearsFound.length > 0) {
      const numericYears = yearsFound.map(y => parseInt(y, 10));
      const maxYear = Math.max(...numericYears);
      detectedTag = `Year mention: ${maxYear}`;
      if (maxYear < currentYear) {
        status = 'potentially_outdated';
        explanation = `Source mentions historic year (${maxYear}) without a fresh cycle timestamp.`;
        recommendation = 'Verify if a newer guideline has replaced this document.';
      } else {
        status = 'undated';
        explanation = 'Mentions current years in body text but lacks formal document publication metadata.';
        recommendation = 'Inspect portal header or archive index for authoritative issue date.';
      }
    } else {
      status = 'date_unavailable';
      explanation = 'No publication date, copyright year, or cycle information found in this source.';
      recommendation = 'Treat undated web pages with caution; locate the timestamped PDF notification.';
    }

    warnings.push({
      id: `outdate-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sourceId: source.id,
      sourceTitle: source.title,
      sourceUrl: source.url,
      detectedDateOrCycle: detectedTag,
      status,
      explanation,
      recommendation,
    });
  }

  return warnings;
}
