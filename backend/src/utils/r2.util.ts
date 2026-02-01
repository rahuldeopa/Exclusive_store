// import { GetObjectCommand } from '@aws-sdk/client-s3';
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
// import { r2Client } from '../config/r2';
// import { env } from '../config/env';

// export async function getSignedR2Url(objectKey: string) {
//   const command = new GetObjectCommand({
//     Bucket: env.R2_BUCKET,
//     Key: objectKey,
//   });

//   return getSignedUrl(r2Client, command, { expiresIn: 300 }); // 5 min
// }
