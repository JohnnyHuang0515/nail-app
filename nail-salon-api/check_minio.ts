import dotenv from 'dotenv';
import { minioClient, BUCKET_NAME, ensureBucketExists } from './src/config/minio.config';

dotenv.config();

async function testConnection() {
    console.log('Testing MinIO Connection...');
    console.log('Endpoint:', process.env.MINIO_ENDPOINT);
    console.log('Port:', process.env.MINIO_PORT);
    console.log('Bucket:', BUCKET_NAME);

    try {
        await ensureBucketExists();
        console.log('✅ Connected to MinIO and bucket exists (or was created).');

        console.log('Listing buckets to verify...');
        const buckets = await minioClient.listBuckets();
        const bucketNames = buckets.map(b => b.name);
        console.log('Buckets found:', bucketNames);

        if (bucketNames.includes(BUCKET_NAME)) {
            console.log(`✅ Bucket '${BUCKET_NAME}' is confirmed present.`);
        } else {
            console.error(`❌ Bucket '${BUCKET_NAME}' NOT found in list!`);
        }

    } catch (error) {
        console.error('❌ Connection failed:', error);
    }
}

testConnection();
