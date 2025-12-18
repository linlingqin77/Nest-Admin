/**
 * 修复文件扩展名格式和生成缩略图
 * 
 * 问题：
 * 1. 旧数据的扩展名包含点号（如 ".jpg"）
 * 2. 图片文件缺少缩略图URL
 * 
 * 解决方案：
 * 1. 去掉扩展名中的点号并转小写
 * 2. 为图片类型的文件添加缩略图URL
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 支持缩略图的图片格式
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico'];

async function fixFileExtensions() {
    console.log('开始修复文件扩展名和缩略图...\n');

    try {
        // 获取所有文件
        const files = await prisma.sysUpload.findMany({
            where: {
                delFlag: '0',
            },
        });

        console.log(`找到 ${files.length} 个文件需要检查\n`);

        let fixedCount = 0;
        let skippedCount = 0;

        for (const file of files) {
            let needsUpdate = false;
            const updateData: any = {};

            // 检查扩展名格式
            if (file.ext) {
                const cleanExt = file.ext.replace('.', '').toLowerCase();
                if (cleanExt !== file.ext) {
                    updateData.ext = cleanExt;
                    needsUpdate = true;
                    console.log(`📝 修复扩展名: ${file.fileName}`);
                    console.log(`   旧值: "${file.ext}" -> 新值: "${cleanExt}"`);
                }

                // 检查是否需要添加缩略图
                if (!file.thumbnail && IMAGE_EXTENSIONS.includes(cleanExt)) {
                    updateData.thumbnail = file.url;
                    needsUpdate = true;
                    console.log(`🖼️  添加缩略图: ${file.fileName}`);
                    console.log(`   URL: ${file.url}`);
                }
            }

            // 执行更新
            if (needsUpdate) {
                await prisma.sysUpload.update({
                    where: { uploadId: file.uploadId },
                    data: updateData,
                });
                fixedCount++;
                console.log(`✅ 已更新\n`);
            } else {
                skippedCount++;
            }
        }

        console.log('\n=== 修复完成 ===');
        console.log(`✅ 修复文件数: ${fixedCount}`);
        console.log(`⏭️  跳过文件数: ${skippedCount}`);
        console.log(`📊 总文件数: ${files.length}`);

    } catch (error) {
        console.error('❌ 修复过程中出错:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// 执行修复
fixFileExtensions()
    .then(() => {
        console.log('\n🎉 脚本执行成功！');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 脚本执行失败:', error);
        process.exit(1);
    });
