import { defineSuite } from '../suite.ts'
import { defineJob } from './job.ts'
import { imagesToPdf, info, merge, pdfToImages, pickPages, rotate, split } from './engine.ts'

const PDF = ['application/pdf', '.pdf']
const IMAGES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/bmp']
const PAGES_HINT = 'Pages like 1-3, 5, 8-. Leave empty for every page.'

const mergePdf = defineJob({
  meta: {
    id: 'pdf-merge',
    name: 'Merge',
    category: 'pdf',
    description: 'Join several PDFs into one.',
    keywords: ['combine', 'join', 'append'],
  },
  accept: PDF,
  many: true,
  title: 'Drop PDFs, paste them, or click to choose',
  detail: 'PDF files only.',
  options: [],
  action: 'Merge PDFs',
  run: merge,
})

const splitPdf = defineJob({
  meta: {
    id: 'pdf-split',
    name: 'Split',
    category: 'pdf',
    description: 'Cut a PDF into several files.',
    keywords: ['cut', 'separate', 'extract', 'divide'],
  },
  accept: PDF,
  many: false,
  title: 'Drop a PDF, paste it, or click to choose',
  detail: 'PDF files only.',
  options: [
    {
      key: 'mode',
      label: 'Split by',
      initial: 'ranges',
      choices: [
        { value: 'ranges', label: 'Ranges' },
        { value: 'every', label: 'Every N pages' },
        { value: 'single', label: 'Each page' },
      ],
    },
    {
      key: 'value',
      label: 'Ranges',
      initial: '',
      placeholder: '1-3, 4-6',
      hint: 'Each comma makes one file.',
      when: (options) => (options['mode'] ?? 'ranges') === 'ranges',
    },
    {
      key: 'value',
      label: 'Pages per file',
      initial: '',
      placeholder: '2',
      when: (options) => options['mode'] === 'every',
    },
  ],
  action: 'Split PDF',
  run: split,
})

const editPages = defineJob({
  meta: {
    id: 'pdf-pages',
    name: 'Keep or remove pages',
    category: 'pdf',
    description: 'Keep, remove, or reorder pages.',
    keywords: ['delete', 'reorder', 'extract', 'select'],
  },
  accept: PDF,
  many: false,
  title: 'Drop a PDF, paste it, or click to choose',
  detail: 'PDF files only.',
  options: [
    {
      key: 'mode',
      label: 'Pages',
      initial: 'keep',
      choices: [
        { value: 'keep', label: 'Keep' },
        { value: 'remove', label: 'Remove' },
      ],
    },
    {
      key: 'pages',
      label: 'Page numbers',
      initial: '',
      placeholder: '3, 1, 2',
      hint: 'Kept pages follow the order written, so 3, 1 puts page 3 first.',
    },
  ],
  action: 'Make PDF',
  run: pickPages,
})

const rotatePdf = defineJob({
  meta: {
    id: 'pdf-rotate',
    name: 'Rotate',
    category: 'pdf',
    description: 'Turn pages clockwise or anticlockwise.',
    keywords: ['turn', 'flip', 'landscape', 'portrait'],
  },
  accept: PDF,
  many: false,
  title: 'Drop a PDF, paste it, or click to choose',
  detail: 'PDF files only.',
  options: [
    {
      key: 'angle',
      label: 'Turn',
      initial: '90',
      choices: [
        { value: '90', label: '90° right' },
        { value: '180', label: '180°' },
        { value: '270', label: '90° left' },
      ],
    },
    { key: 'pages', label: 'Pages', initial: '', placeholder: 'All pages', hint: PAGES_HINT },
  ],
  action: 'Rotate PDF',
  run: rotate,
})

const pdfInfo = defineJob({
  meta: {
    id: 'pdf-info',
    name: 'Inspect',
    category: 'pdf',
    description: 'Page count, page size, and document details.',
    keywords: ['metadata', 'properties', 'pages', 'author'],
  },
  accept: PDF,
  many: false,
  title: 'Drop a PDF, paste it, or click to choose',
  detail: 'PDF files only.',
  options: [],
  action: 'Read PDF',
  auto: true,
  run: info,
})

const toPdf = defineJob({
  meta: {
    id: 'images-to-pdf',
    name: 'Images to PDF',
    category: 'pdf',
    description: 'Put pictures on pages, one per page.',
    keywords: ['jpg', 'png', 'photo', 'scan', 'create'],
  },
  accept: IMAGES,
  many: true,
  title: 'Drop images, paste them, or click to choose',
  detail: 'PNG, JPG, WebP, GIF, and BMP.',
  options: [
    {
      key: 'size',
      label: 'Page size',
      initial: 'fit',
      choices: [
        { value: 'fit', label: 'Fit image' },
        { value: 'a4', label: 'A4' },
        { value: 'letter', label: 'Letter' },
      ],
    },
  ],
  action: 'Make PDF',
  run: imagesToPdf,
})

const fromPdf = defineJob({
  meta: {
    id: 'pdf-to-images',
    name: 'PDF to images',
    category: 'pdf',
    description: 'Draw each page as a PNG or JPG.',
    keywords: ['png', 'jpg', 'render', 'screenshot', 'export'],
  },
  accept: PDF,
  many: false,
  title: 'Drop a PDF, paste it, or click to choose',
  detail: 'PDF files only.',
  options: [
    {
      key: 'format',
      label: 'Format',
      initial: 'png',
      choices: [
        { value: 'png', label: 'PNG' },
        { value: 'jpg', label: 'JPG' },
      ],
    },
    {
      key: 'scale',
      label: 'Sharpness',
      initial: '2',
      choices: [
        { value: '1', label: 'Screen' },
        { value: '2', label: 'Sharp' },
        { value: '3', label: 'Print' },
      ],
    },
    { key: 'pages', label: 'Pages', initial: '', placeholder: 'All pages', hint: PAGES_HINT },
  ],
  action: 'Draw pages',
  run: pdfToImages,
})

export const pdfSuites = [
  defineSuite({
    meta: {
      id: 'organize-pdf',
      name: 'Organize PDF',
      category: 'pdf',
      description: 'Merge, split, reorder, rotate, and inspect PDFs.',
    },
    tools: [mergePdf, splitPdf, editPages, rotatePdf, pdfInfo],
  }),
  defineSuite({
    meta: {
      id: 'convert-pdf',
      name: 'PDF and images',
      category: 'pdf',
      description: 'Turn pictures into a PDF, or PDF pages into pictures.',
    },
    tools: [toPdf, fromPdf],
  }),
]
