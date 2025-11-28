import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdir, stat, mkdir } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const IMAGES_DIR = join(__dirname, '../src/shared/assets/images');
const OPTIMIZED_DIR = join(__dirname, '../src/shared/assets/images-optimized');

// 최적화 설정
const OPTIMIZATION_CONFIG = {
  // 배경 이미지: 4K 대응 + WebP
  backgrounds: {
    pattern: /_bg\.png$/,
    width: 3840,
    format: 'webp',
    quality: 85
  },
  // popo 캐릭터: 적당한 크기 + WebP
  popoLarge: {
    pattern: /^popo[1-4]\.png$/,
    width: 1200,
    format: 'webp',
    quality: 90
  },
  // 기타 popo 이미지
  popoMedium: {
    pattern: /(popo_chu|warning_popo)\.png$/,
    width: 800,
    format: 'webp',
    quality: 90
  },
  // 일반 아이콘/작은 이미지들
  icons: {
    pattern: /\.(png|jpg|jpeg)$/,
    maxWidth: 500,
    format: 'webp',
    quality: 85
  }
};

async function getFileSize(filePath) {
  const stats = await stat(filePath);
  return stats.size;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function getOptimizationConfig(filename) {
  for (const [name, config] of Object.entries(OPTIMIZATION_CONFIG)) {
    if (config.pattern.test(filename)) {
      return { name, ...config };
    }
  }
  return null;
}

async function optimizeImage(inputPath, outputPath, config) {
  const image = sharp(inputPath);
  const metadata = await image.metadata();

  let pipeline = image;

  // 리사이징 (필요한 경우)
  if (config.width && metadata.width > config.width) {
    pipeline = pipeline.resize(config.width, null, {
      fit: 'inside',
      withoutEnlargement: true
    });
  } else if (config.maxWidth && metadata.width > config.maxWidth) {
    pipeline = pipeline.resize(config.maxWidth, null, {
      fit: 'inside',
      withoutEnlargement: true
    });
  }

  // 포맷 변환
  if (config.format === 'webp') {
    pipeline = pipeline.webp({ quality: config.quality });
  } else if (config.format === 'jpeg') {
    pipeline = pipeline.jpeg({ quality: config.quality });
  }

  await pipeline.toFile(outputPath);
}

async function processImages() {
  console.log('🖼️  이미지 최적화 시작...\n');

  // 출력 디렉토리 생성
  try {
    await mkdir(OPTIMIZED_DIR, { recursive: true });
  } catch (err) {
    // 이미 존재하는 경우 무시
  }

  const files = await readdir(IMAGES_DIR);
  const imageFiles = files.filter(f => /\.(png|jpg|jpeg)$/i.test(f));

  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;
  const results = [];

  for (const filename of imageFiles) {
    const inputPath = join(IMAGES_DIR, filename);
    const config = getOptimizationConfig(filename);

    if (!config) {
      console.log(`⏭️  ${filename} - 최적화 설정 없음, 건너뜀`);
      continue;
    }

    const outputFilename = filename.replace(/\.(png|jpg|jpeg)$/i, `.${config.format}`);
    const outputPath = join(OPTIMIZED_DIR, outputFilename);

    try {
      const originalSize = await getFileSize(inputPath);

      console.log(`⚙️  ${filename} 처리 중... (${config.name})`);
      await optimizeImage(inputPath, outputPath, config);

      const optimizedSize = await getFileSize(outputPath);
      const reduction = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);

      totalOriginalSize += originalSize;
      totalOptimizedSize += optimizedSize;

      results.push({
        filename,
        outputFilename,
        originalSize,
        optimizedSize,
        reduction
      });

      console.log(`✅ ${filename} → ${outputFilename}`);
      console.log(`   ${formatBytes(originalSize)} → ${formatBytes(optimizedSize)} (-${reduction}%)\n`);

    } catch (err) {
      console.error(`❌ ${filename} 처리 실패:`, err.message);
    }
  }

  // 최종 결과
  console.log('\n' + '='.repeat(60));
  console.log('📊 최적화 결과 요약\n');

  results.sort((a, b) => (b.originalSize - b.optimizedSize) - (a.originalSize - a.optimizedSize));

  console.log('상위 절감 파일:');
  results.slice(0, 5).forEach((r, i) => {
    console.log(`${i + 1}. ${r.filename}`);
    console.log(`   ${formatBytes(r.originalSize)} → ${formatBytes(r.optimizedSize)} (-${r.reduction}%)`);
  });

  const totalReduction = ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize * 100).toFixed(1);

  console.log('\n총 용량:');
  console.log(`원본: ${formatBytes(totalOriginalSize)}`);
  console.log(`최적화: ${formatBytes(totalOptimizedSize)}`);
  console.log(`절감: ${formatBytes(totalOriginalSize - totalOptimizedSize)} (-${totalReduction}%)`);
  console.log('='.repeat(60));
  console.log(`\n✨ 최적화된 이미지는 ${OPTIMIZED_DIR} 에 저장되었습니다.`);
  console.log('확인 후 원본 파일들을 교체하세요.\n');
}

processImages().catch(console.error);
