import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkEcsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "Vpc", {});

    const cluster = new ecs.Cluster(this, "Cluster", {
      vpc,
    });

    const taskDefinition = new ecs.FargateTaskDefinition(
      this,
      "TaskDefinition"
    );
    taskDefinition.addContainer("helloworld", {
      image: ecs.ContainerImage.fromRegistry(
        "public.ecr.aws/dnxsolutions/nginx-hello:1.0.0"
      ),
      portMappings: [{ containerPort: 80 }],
    });

    const service = new ecs.FargateService(this, "Service", {
      cluster,
      taskDefinition,
      desiredCount: 2,
    });

    const alb = new elbv2.ApplicationLoadBalancer(this, "ALB", {
      vpc,
      internetFacing: true,
    });

    const listener = alb.addListener("Listener", {
      port: 80,
    });

    listener.addTargets("TargetGroup", {
      port: 80,
      targets: [service],
    });

    new cdk.CfnOutput(this, "LoadBalancerDNS", {
      value: listener.loadBalancer.loadBalancerDnsName,
    });
  }
}
