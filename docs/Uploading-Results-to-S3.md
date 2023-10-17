# Uploading Results to S3

## Prequisite

### AWS CLI

Make sure the AWS CLI is installed on your system.

For instructions on how to install it check [this](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) page.

### Required Environment Variables

Before starting the upload script verify that all required environment variables are set.

```bash
echo $TESTS_ARTIFACTS_BUCKET
echo $TESTS_ARTIFACTS_KEY
echo $TESTS_ARTIFACTS_SECRET
```

If nothing is shown set the environment variables:

```bash
export TESTS_ARTIFACTS_BUCKET=your-bucket-name
export TESTS_ARTIFACTS_KEY=your-key
export TESTS_ARTIFACTS_SECRET=your-secret
```

## Uploading the Artifacts

Execute this script from the root of the repository:

```bash
shell/upload-results-to-s3.sh results/
```

The script will mirror the folder structure from the `/results` folder and (re)upload **all** files from it.

If the script was executed correctly, you should see some output like this:

```text
upload: results/2023/10/05/k6_report_20231005_224948.json to s3://robot-api-ci/k6-test-results/2023/10/05/k6_report_20231005_224948.json
upload: results/2023/10/05/k6_report_20231005_225017.json to s3://robot-api-ci/k6-test-results/2023/10/05/k6_report_20231005_225017.json
upload: results/2023/10/05/k6_report_20231005_231233.json to s3://robot-api-ci/k6-test-results/2023/10/05/k6_report_20231005_231233.json
```
