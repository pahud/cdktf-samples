import { Construct } from 'constructs';
import { DataAwsAmi, DataAwsAvailabilityZones as AZ } from '../.gen/providers/aws'
// import { Ec2Instance } from './.gen/modules/terraform-aws-modules/ec2-instance/aws';
import { Vpc } from '../.gen/modules/terraform-aws-modules/vpc/aws';



export interface VpcBaseProps {
  readonly cidr?: string;
  readonly privateSubnets?: string[];
  readonly publicSubnets?: string[];
  readonly enableNatGateway?: boolean;
  readonly singleNatGateway?: boolean;
}

export class VpcProvider extends Construct{
  readonly vpc: Vpc;

  static getOrCreate(scope: Construct) {
    return new VpcProvider(scope, 'Vpc')
  }
  constructor(scope: Construct, id: string, props: VpcBaseProps = {}){
    super(scope, id)

    this.vpc = new Vpc(scope, 'VpcResource', {
      cidr:  props.cidr ?? '10.0.0.0/16',
      privateSubnets: props.privateSubnets ?? ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"],
      publicSubnets: props.publicSubnets ?? ["10.0.4.0/24", "10.0.5.0/24", "10.0.6.0/24"],
      azs: new AZ(scope, 'AZs').names,
      enableNatGateway: props.enableNatGateway ?? true,
      singleNatGateway: props.singleNatGateway ?? true,
    })
  }

  public get privateSubnets(): string[] {
    return this.vpc.privateSubnetsOutput as unknown as string[]
  }

  public get publicSubnets(): string[] {
    return this.vpc.publicSubnetsOutput as unknown as string[]
  }

  public privateSubnet(index: number): string {
    return this.elementFromList(this.privateSubnets, index)
  }

  public publicSubnet(index: number): string {
    return this.elementFromList(this.publicSubnets, index)
  }

  private elementFromList(attribute: string[], index: number): string {
    return `\${element("${attribute}", ${index})}`
  }
}

export class MachineImage {
  static latestAmazonLinux2Ami(stack: Construct) {
    return new DataAwsAmi(stack, 'AmiDAta', {
      owners: ['amazon'],
      mostRecent: true,
      filter: [
        {
          name: 'owner-alias',
          values: ['amazon'],
        },
        {
          name: 'name',
          values: ['amzn2-ami-hvm*'],
        }
      ]
    })
  }
}
