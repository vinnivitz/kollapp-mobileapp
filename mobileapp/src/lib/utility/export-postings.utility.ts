import type { ExportPostingsConfig, ExportPostingsFormat } from '$lib/models/export-postings';
import type {
	ActivityTO,
	OrganizationBudgetCategoryResponseTO,
	PersonOfOrganizationTO,
	PostingTO
} from '@kollapp/api-types';

import { TZDate } from '@date-fns/tz';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import { get } from 'svelte/store';

import { formatter } from './formatter.utility';

import { t } from '$lib/locales';

/**
 * Generates CSV content from postings
 * @param postings The postings to include in the CSV
 * @param config The export configuration
 * @returns {string} The generated CSV content
 */
export function generateCSV(postings: PostingTO[], config: ExportPostingsConfig): string {
	const $t = get(t);
	const { activities, categories, members } = config;

	const headers = [
		$t('utility.export.date'),
		$t('utility.export.type'),
		$t('utility.export.amount'),
		$t('utility.export.purpose'),
		$t('utility.export.category'),
		$t('utility.export.person-of-organization'),
		$t('utility.export.activity')
	];

	const rows: string[][] = [headers];

	for (const posting of postings) {
		const row = [
			formatter.date(posting.date),
			posting.type === 'CREDIT' ? $t('utility.export.credit') : $t('utility.export.debit'),
			formatAmount(posting.amountInCents),
			posting.purpose,
			getCategoryName(posting.organizationBudgetCategoryId, categories),
			getMemberName(posting.personOfOrganizationId, members, $t('utility.export.no-member')),
			getActivityName(posting.id, activities, $t('utility.export.no-activity'))
		];
		rows.push(row.map((value) => escapeCsvField(value)));
	}

	const totalCredit = postings
		.filter((posting) => posting.type === 'CREDIT')
		.reduce((sum, posting) => sum + posting.amountInCents, 0);
	const totalDebit = postings
		.filter((posting) => posting.type === 'DEBIT')
		.reduce((sum, posting) => sum + posting.amountInCents, 0);
	const balance = totalCredit - totalDebit;

	rows.push(
		[],
		[$t('utility.export.total-credit'), escapeCsvField(formatAmount(totalCredit))],
		[$t('utility.export.total-debit'), escapeCsvField(formatAmount(totalDebit))],
		[$t('utility.export.balance'), escapeCsvField(formatAmount(balance))]
	);

	return rows.map((row) => row.join(',')).join('\n');
}

/**
 * Generates PDF document from postings
 * @param postings The postings to include in the PDF
 * @param config The export configuration
 * @returns {jsPDF} The generated jsPDF document
 */
export function generatePDF(postings: PostingTO[], config: ExportPostingsConfig): jsPDF {
	const $t = get(t);
	const { activities, activityDate, activityName, categories, memberName, members, organizationName } = config;

	const document_ = new jsPDF({
		format: 'a4',
		orientation: 'portrait',
		unit: 'mm'
	});

	const pageWidth = document_.internal.pageSize.getWidth();
	const pageHeight = document_.internal.pageSize.getHeight();
	const margin = 15;
	const contentWidth = pageWidth - 2 * margin;
	let yPosition = margin;

	yPosition = renderHeader(
		document_,
		config,
		$t,
		margin,
		yPosition,
		organizationName,
		activityName,
		activityDate,
		memberName
	);

	const colWidths = [25, 15, 15, contentWidth - 150, 30, 30, 30];
	const colHeaders = [
		$t('utility.export.date'),
		$t('utility.export.type'),
		$t('utility.export.amount'),
		$t('utility.export.purpose'),
		$t('utility.export.category'),
		$t('utility.export.person-of-organization'),
		$t('utility.export.activity')
	];

	yPosition = renderTableHeader(document_, colHeaders, colWidths, margin, yPosition, contentWidth);

	yPosition = renderPostingRows(
		document_,
		postings,
		colWidths,
		margin,
		yPosition,
		pageHeight,
		$t,
		categories,
		members,
		activities
	);

	renderSummary(document_, postings, margin, yPosition, pageHeight, $t);

	return document_;
}

function renderHeader(
	document_: jsPDF,
	config: ExportPostingsConfig,
	$t: (key: string, parameters?: Record<string, unknown>) => string,
	margin: number,
	yPosition: number,
	organizationName: string,
	activityName: string | undefined,
	activityDate: string | undefined,
	memberName: string | undefined
): number {
	document_.setFontSize(18);
	document_.setFont('helvetica', 'bold');
	document_.text(config.title, margin, yPosition);
	yPosition += 8;

	document_.setFontSize(14);
	document_.setFont('helvetica', 'normal');
	document_.text($t('utility.export.organization', { value: organizationName }), margin, yPosition);
	yPosition += 6;

	const optionalFields = [
		{ key: 'utility.export.activity-title', value: activityName },
		{ key: 'utility.export.activity-date', value: activityDate ? formatter.date(activityDate) : undefined },
		{ key: 'utility.export.member-name', value: memberName }
	];

	for (const field of optionalFields) {
		if (field.value) {
			document_.setFontSize(12);
			document_.setFont('helvetica', 'italic');
			document_.text($t(field.key, { value: field.value }), margin, yPosition);
			yPosition += 6;
		}
	}

	return yPosition;
}

function renderTableHeader(
	document_: jsPDF,
	colHeaders: string[],
	colWidths: number[],
	margin: number,
	yPosition: number,
	contentWidth: number
): number {
	document_.setFontSize(9);
	document_.setFont('helvetica', 'bold');
	document_.setFillColor(240, 240, 240);
	document_.rect(margin, yPosition - 4, contentWidth, 7, 'F');

	let xPosition = margin;
	for (const [index, colHeader] of colHeaders.entries()) {
		document_.text(colHeader!, xPosition + 1, yPosition);
		xPosition += colWidths[index]!;
	}

	return yPosition + 6;
}

function renderPostingRows(
	document_: jsPDF,
	postings: PostingTO[],
	colWidths: number[],
	margin: number,
	yPosition: number,
	pageHeight: number,
	$t: (key: string, parameters?: Record<string, unknown>) => string,
	categories: OrganizationBudgetCategoryResponseTO[],
	members: PersonOfOrganizationTO[],
	activities: ActivityTO[]
): number {
	const contentWidth = colWidths.reduce((sum, w) => sum + w, 0);

	document_.setFont('helvetica', 'normal');
	document_.setFontSize(8);

	for (const posting of postings) {
		if (yPosition > pageHeight - 30) {
			document_.addPage();
			yPosition = margin;
		}

		const rowData = [
			formatter.date(posting.date),
			posting.type === 'CREDIT' ? $t('utility.export.credit') : $t('utility.export.debit'),
			formatAmount(posting.amountInCents),
			truncateText(posting.purpose, 35, 32),
			getCategoryName(posting.organizationBudgetCategoryId, categories),
			getMemberName(posting.personOfOrganizationId, members, $t('utility.export.no-member')),
			getActivityName(posting.id, activities, $t('utility.export.no-activity'))
		];

		let xPosition = margin;
		for (const [index, rowDatum] of rowData.entries()) {
			const text = index > 2 ? truncateText(rowDatum!, 20, 17) : rowDatum!;
			document_.text(text, xPosition + 1, yPosition);
			xPosition += colWidths[index]!;
		}

		document_.setDrawColor(220);
		document_.line(margin, yPosition + 2, margin + contentWidth, yPosition + 2);
		yPosition += 6;
	}

	return yPosition + 5;
}

function renderSummary(
	document_: jsPDF,
	postings: PostingTO[],
	margin: number,
	yPosition: number,
	pageHeight: number,
	$t: (key: string, parameters?: Record<string, unknown>) => string
): void {
	if (yPosition > pageHeight - 25) {
		document_.addPage();
		yPosition = margin;
	}

	const totalCredit = postings.filter((p) => p.type === 'CREDIT').reduce((sum, p) => sum + p.amountInCents, 0);
	const totalDebit = postings.filter((p) => p.type === 'DEBIT').reduce((sum, p) => sum + p.amountInCents, 0);
	const balance = totalCredit - totalDebit;

	document_.setFont('helvetica', 'bold');
	document_.setFontSize(10);

	document_.text($t('utility.export.total-credit'), margin, yPosition);
	document_.text(formatAmount(totalCredit), margin + 60, yPosition);
	yPosition += 5;

	document_.text($t('utility.export.total-debit'), margin, yPosition);
	document_.text(formatAmount(totalDebit), margin + 60, yPosition);
	yPosition += 5;

	document_.setFontSize(12);
	document_.text(`${$t('utility.export.balance')}:`, margin, yPosition);
	document_.text(formatAmount(balance), margin + 60, yPosition);
	yPosition += 10;

	document_.setFontSize(10);
	document_.setTextColor(100);
	const generatedAt = $t('utility.export.generated-at', { value: formatter.date(new TZDate().toISOString()) });
	document_.text(generatedAt, margin, yPosition);
	document_.setTextColor(0);
}

function truncateText(text: string, maxLength: number, truncateAt: number): string {
	return text.length > maxLength ? text.slice(0, truncateAt) + '...' : text;
}

/**
 * Downloads postings as CSV file
 */
export function downloadCSV(postings: PostingTO[], config: ExportPostingsConfig): void {
	const csvContent = generateCSV(postings, config);
	const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
	saveAs(blob, generateFilename(config.organizationName, 'csv'));
}

/**
 * Downloads postings as PDF file
 */
export function downloadPDF(postings: PostingTO[], config: ExportPostingsConfig): void {
	const document_ = generatePDF(postings, config);
	document_.save(generateFilename(config.organizationName, 'pdf'));
}

/**
 * Exports postings in the specified format
 */
export function exportPostings(
	postings: PostingTO[],
	config: ExportPostingsConfig,
	format: ExportPostingsFormat
): void {
	if (format === 'csv') {
		downloadCSV(postings, config);
	} else {
		downloadPDF(postings, config);
	}
}

function getMemberName(
	personOfOrganizationId: number,
	members: PersonOfOrganizationTO[],
	noMemberText: string
): string {
	const member = members.find((m) => m.id === personOfOrganizationId);
	return member?.username ?? noMemberText;
}

function getCategoryName(categoryId: number, categories: OrganizationBudgetCategoryResponseTO[]): string {
	const category = categories.find((c) => c.id === categoryId);
	return category?.name ?? '';
}

function getActivityName(postingId: number, activities: ActivityTO[], noActivityText: string): string {
	for (const activity of activities) {
		if (activity.activityPostings.some((posting) => posting.id === postingId)) {
			return activity.name;
		}
	}
	return noActivityText;
}

function formatAmount(cents: number): string {
	return formatter.currency(cents);
}

function generateFilename(organizationName: string, extension: string): string {
	const $t = get(t);
	const safeName = organizationName.replaceAll(/[^a-zA-Z0-9]/g, '_').toLowerCase();
	const dateString = new Date().toISOString().split('T')[0];
	return `${safeName}_${$t('utility.export.postings')}_${dateString}.${extension}`;
}

function escapeCsvField(value: string): string {
	if (value.includes(',') || value.includes('"') || value.includes('\n')) {
		return `"${value.replaceAll('"', '""')}"`;
	}
	return value;
}
