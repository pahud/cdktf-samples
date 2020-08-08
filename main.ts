import { Construct } from 'constructs';
import { App, TerraformStack, TerraformOutput } from 'cdktf';
import { AwsProvider, Instance  } from './.gen/providers/aws'
import { VpcProvider, MachineImage } from './lib'


export interface Ec2StackProps {
  readonly ami?: string;
  readonly instanceType?: string;
}

class Ec2Stack extends TerraformStack {
  constructor(scope: Construct, name: string, props: Ec2StackProps = {}) {
    super(scope, name);

    new AwsProvider(this, 'aws', {
      region: process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION ?? 'us-east-1',
    });

    const vpc = VpcProvider.getOrCreate(this)

    const amzn2 = MachineImage.latestAmazonLinux2Ami(this)

    const instance = new Instance(this, 'Instance', {
      ami: props.ami ?? amzn2.imageId,
      instanceType: props.instanceType ?? 't3.large',
      subnetId: vpc.publicSubnet(0)
      }
    )

    new TerraformOutput(this, 'VpcId', { value: vpc.vpc.vpcIdOutput })
    new TerraformOutput(this, 'AmiID', { value: amzn2.imageId })
    new TerraformOutput(this, 'InstanceId', { value: instance.id })

    if (instance.associatePublicIpAddress) {
      new TerraformOutput(this, 'InstanceIp', { value: instance.publicIp })
    }
  }
}

const app = new App();
new Ec2Stack(app, 'cdktf-ec2stack');
app.synth();
