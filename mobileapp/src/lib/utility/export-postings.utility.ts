import type { ExportPostingsConfig } from '$lib/models/export-postings';
import type {
	ActivityTO,
	OrganizationBudgetCategoryResponseTO,
	PersonOfOrganizationTO,
	PostingTO
} from '@kollapp/api-types';

import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { TZDate } from '@date-fns/tz';
import { actionSheetController } from '@ionic/core';
import { EmailComposer } from 'capacitor-email-composer';
import { documentOutline, downloadOutline, listOutline, mailOutline, shareOutline } from 'ionicons/icons';
import { jsPDF } from 'jspdf';
import { get } from 'svelte/store';

import { dev } from '$app/environment';

import { showAlert } from './alert.utility';
import { formatter } from './formatter.utility';
import { informationModal } from './ui.utility';

import { t } from '$lib/locales';

/**
 * Handles the export postings action by showing an action sheet to choose the format
 * and triggering the download
 * @param postings The postings to export
 * @param config The export configuration
 * @return {Promise<void>} A promise that resolves when the action is complete
 */
export async function exportPostings(postings: PostingTO[], config: ExportPostingsConfig): Promise<void> {
	const $t = get(t);

	const actionSheet = await actionSheetController.create({
		buttons: [
			{
				handler: () => showExportActionSheet(postings, config, 'pdf'),
				icon: documentOutline,
				text: $t('utility.export-postings.modal.pdf')
			},
			{
				handler: () => showExportActionSheet(postings, config, 'csv'),
				icon: listOutline,
				text: $t('utility.export-postings.modal.csv')
			}
		],
		header: $t('utility.export-postings.modal.header')
	});
	await actionSheet.present();
}

async function showExportActionSheet(
	postings: PostingTO[],
	config: ExportPostingsConfig,
	format: 'csv' | 'pdf'
): Promise<void> {
	const $t = get(t);

	const actionSheet = await actionSheetController.create({
		buttons: [
			{
				handler: () => downloadFile(postings, config, format),
				icon: downloadOutline,
				text: $t('utility.export-postings.modal.download')
			},
			{
				handler: () => shareFile(postings, config, format),
				icon: shareOutline,
				text: $t('utility.export-postings.modal.share')
			},
			{
				handler: () => sendEmail(postings, config, format),
				icon: mailOutline,
				text: $t('utility.export-postings.modal.email')
			}
		],
		header: $t('utility.export-postings.modal.action-header')
	});
	await actionSheet.present();
}

async function shareFile(postings: PostingTO[], config: ExportPostingsConfig, format: 'csv' | 'pdf'): Promise<void> {
	const $t = get(t);
	const result = await Share.canShare();

	if (!result.value) {
		await showAlert($t('utility.export-postings.share.error'));
		return;
	}

	try {
		const filename = generateFilename(config.organizationName, format);
		const base64 = format === 'pdf' ? generatePDFBase64(postings, config) : generateCSVBase64(postings, config);

		const writeResult = await Filesystem.writeFile({
			data: base64,
			directory: Directory.Cache,
			path: filename
		});

		await Share.share({
			dialogTitle: config.title,
			files: [writeResult.uri],
			title: config.title
		});

		await Filesystem.deleteFile({
			directory: Directory.Cache,
			path: filename
		});
	} catch {
		if (dev) console.info('Sharing not supported on this platform');
	}
}

async function sendEmail(postings: PostingTO[], config: ExportPostingsConfig, format: 'csv' | 'pdf'): Promise<void> {
	const $t = get(t);

	try {
		const hasAccountResult = await EmailComposer.hasAccount();

		if (!hasAccountResult.hasAccount) {
			await showAlert($t('utility.export-postings.email.error'));
			return;
		}

		const filename = generateFilename(config.organizationName, format);
		const base64 = format === 'pdf' ? generatePDFBase64(postings, config) : generateCSVBase64(postings, config);

		await EmailComposer.open({
			attachments: [
				{
					name: filename,
					path: base64,
					type: 'base64'
				}
			],
			body: $t('utility.export-postings.email.body', { value: config.organizationName }),
			subject: config.title
		});
	} catch {
		await showAlert($t('utility.export-postings.email.unsupported'));
	}
}

async function downloadFile(postings: PostingTO[], config: ExportPostingsConfig, format: 'csv' | 'pdf'): Promise<void> {
	const $t = get(t);

	try {
		const filename = generateFilename(config.organizationName, format);
		const base64 = format === 'pdf' ? generatePDFBase64(postings, config) : generateCSVBase64(postings, config);

		try {
			const permissionStatus = await Filesystem.checkPermissions();
			if (permissionStatus.publicStorage !== 'granted') {
				const requestResult = await Filesystem.requestPermissions();
				if (requestResult.publicStorage !== 'granted') {
					await Filesystem.writeFile({
						data: base64,
						directory: Directory.External,
						path: filename,
						recursive: true
					});
					await informationModal(
						$t('utility.export-postings.download.title'),
						$t('utility.export-postings.download-external.message', { value: filename })
					);
					return;
				}
			}

			await Filesystem.writeFile({
				data: base64,
				directory: Directory.Documents,
				path: filename,
				recursive: true
			});
		} catch {
			await Filesystem.writeFile({
				data: base64,
				directory: Directory.External,
				path: filename,
				recursive: true
			});
		}

		await informationModal(
			$t('utility.export-postings.download-internal.title'),
			$t('utility.export-postings.download-internal.message', { value: filename })
		);
	} catch {
		await showAlert($t('utility.export-postings.download.error'));
	}
}

function generatePDFBase64(postings: PostingTO[], config: ExportPostingsConfig): string {
	const document_ = generatePDF(postings, config);
	return document_.output('datauristring').split(',')[1] ?? '';
}

function generateCSVBase64(postings: PostingTO[], config: ExportPostingsConfig): string {
	const csvContent = generateCSV(postings, config);
	return btoa(unescape(encodeURIComponent(csvContent)));
}

function generateCSV(postings: PostingTO[], config: ExportPostingsConfig): string {
	const $t = get(t);
	const { activities, budgetCategories, personsOfOrganization } = config;

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
			getCategoryName(posting.organizationBudgetCategoryId, budgetCategories),
			getMemberName(posting.personOfOrganizationId, personsOfOrganization, $t('utility.export.no-member')),
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

function generatePDF(postings: PostingTO[], config: ExportPostingsConfig): jsPDF {
	const $t = get(t);
	const {
		activities,
		activityDate,
		activityName,
		budgetCategories,
		organizationName,
		personOfOrganizationName: memberName,
		personsOfOrganization
	} = config;

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
		budgetCategories,
		personsOfOrganization,
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

	if (activityName) {
		document_.setFontSize(12);
		document_.setFont('helvetica', 'italic');
		document_.text($t('utility.export.activity-title', { value: activityName }), margin, yPosition);
		yPosition += 6;
	}

	if (activityDate) {
		document_.setFontSize(12);
		document_.setFont('helvetica', 'italic');
		document_.text($t('utility.export.activity-date', { value: formatter.date(activityDate) }), margin, yPosition);
		yPosition += 6;
	}

	if (memberName) {
		document_.setFontSize(12);
		document_.setFont('helvetica', 'italic');
		document_.text($t('utility.export.member-name', { value: memberName }), margin, yPosition);
		yPosition += 6;
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
	const dateString = new TZDate().toISOString().split('T')[0];
	return `${safeName}_${$t('utility.export.postings')}_${dateString}.${extension}`;
}

function escapeCsvField(value: string): string {
	if (value.includes(',') || value.includes('"') || value.includes('\n')) {
		return `"${value.replaceAll('"', '""')}"`;
	}
	return value;
}
