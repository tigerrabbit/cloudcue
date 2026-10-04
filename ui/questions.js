window.STUDY_BANK = {
  "version": 1,
  "updated": "2026-10-04",
  "sources": {
    "outline": {
      "title": "ISC2: CCSP Outline effective August 1, 2026",
      "url": "https://www.isc2.org/certifications/ccsp/ccsp-certification-exam-outline"
    },
    "nist_cloud": {
      "title": "NIST SP 800-145: Cloud Definition",
      "url": "https://csrc.nist.gov/pubs/sp/800/145/final"
    },
    "shared": {
      "title": "Microsoft: Shared Responsibility",
      "url": "https://learn.microsoft.com/en-us/azure/security/fundamentals/shared-responsibility"
    },
    "aws_shared": {
      "title": "AWS: Shared Responsibility",
      "url": "https://aws.amazon.com/compliance/shared-responsibility-model/"
    },
    "nist_privacy": {
      "title": "NIST SP 800-144: Cloud Security and Privacy",
      "url": "https://csrc.nist.gov/pubs/sp/800/144/final"
    },
    "crypto": {
      "title": "OWASP: Cryptographic Storage",
      "url": "https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html"
    },
    "secrets": {
      "title": "OWASP: Secrets Management",
      "url": "https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html"
    },
    "sanitize": {
      "title": "NIST SP 800-88 Rev. 2: Media Sanitization",
      "url": "https://csrc.nist.gov/pubs/sp/800/88/r2/final"
    },
    "zero": {
      "title": "NIST SP 800-207: Zero Trust",
      "url": "https://csrc.nist.gov/pubs/sp/800/207/final"
    },
    "bcdr": {
      "title": "NIST SP 800-34 Rev. 1: Contingency Planning",
      "url": "https://csrc.nist.gov/pubs/sp/800/34/r1/upd1/final"
    },
    "authorization": {
      "title": "OWASP: Authorization",
      "url": "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html"
    },
    "rest": {
      "title": "OWASP: REST Security",
      "url": "https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html"
    },
    "threat": {
      "title": "OWASP: Threat Modeling",
      "url": "https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html"
    },
    "testing": {
      "title": "OWASP: DevSecOps Guideline",
      "url": "https://devguide.owasp.org/en/09-operations/01-devsecops/"
    },
    "component": {
      "title": "OWASP: Component Analysis",
      "url": "https://community.owasp.org/Component_Analysis"
    },
    "logging": {
      "title": "OWASP: Logging",
      "url": "https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html"
    },
    "incident": {
      "title": "NIST SP 800-61 Rev. 3: Incident Response",
      "url": "https://csrc.nist.gov/pubs/sp/800/61/r3/final"
    },
    "gdpr": {
      "title": "European Commission: Controller and Processor Roles",
      "url": "https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/application-gdpr_en"
    },
    "assurance": {
      "title": "AWS: Assurance Mechanisms",
      "url": "https://docs.aws.amazon.com/whitepapers/latest/aws-operational-resilience/assurance-mechanisms.html"
    },
    "csa": {
      "title": "CSA: Security Guidance v5",
      "url": "https://cloudsecurityalliance.org/research/guidance"
    }
  },
  "questions": [
    {
      "id": "CCSP-001",
      "track": "ccsp",
      "topic": "1. Cloud Concepts, Architecture and Design",
      "source": "nist_cloud",
      "prompt": "A team provisions compute automatically without a provider employee fulfilling each request. Which cloud characteristic is illustrated?",
      "options": [
        "Manual capacity reservation",
        "Single tenancy",
        "Physical media sanitization",
        "On-demand self-service"
      ],
      "correct": 3,
      "explanation": "On-demand self-service lets consumers provision resources without human interaction with the provider for each request."
    },
    {
      "id": "CCSP-002",
      "track": "ccsp",
      "topic": "1. Cloud Concepts, Architecture and Design",
      "source": "nist_cloud",
      "prompt": "A service adds capacity rapidly during demand spikes and releases it afterward. Which characteristic fits?",
      "options": [
        "Cryptographic erase",
        "Data sovereignty",
        "Non-repudiation",
        "Rapid elasticity"
      ],
      "correct": 3,
      "explanation": "Elasticity concerns resource expansion and contraction as demand changes."
    },
    {
      "id": "CCSP-003",
      "track": "ccsp",
      "topic": "1. Cloud Concepts, Architecture and Design",
      "source": "shared",
      "prompt": "In a typical IaaS deployment, who patches the customer's guest operating system?",
      "options": [
        "The SaaS application's end users",
        "The cloud provider automatically in every IaaS service",
        "The hardware manufacturer in every case",
        "The customer, unless a separate managed-service agreement assigns the task"
      ],
      "correct": 3,
      "explanation": "IaaS customers generally manage guest operating systems; responsibilities must be checked against the actual service and contract."
    },
    {
      "id": "CCSP-004",
      "track": "ccsp",
      "topic": "1. Cloud Concepts, Architecture and Design",
      "source": "shared",
      "prompt": "Which responsibility generally remains with a SaaS customer?",
      "options": [
        "Patching the provider's hypervisor",
        "Maintaining the provider's physical data center",
        "Replacing failed provider disks",
        "Managing its data, identities, and permitted access"
      ],
      "correct": 3,
      "explanation": "Outsourcing infrastructure does not remove the customer's data and access responsibilities."
    },
    {
      "id": "CCSP-005",
      "track": "ccsp",
      "topic": "1. Cloud Concepts, Architecture and Design",
      "source": "nist_cloud",
      "prompt": "A developer deploys application code while the provider operates the underlying OS and runtime platform. Which service model fits best?",
      "options": [
        "On-premises colocation",
        "PaaS",
        "Bare-metal hosting with customer-managed runtime",
        "IaaS with customer-managed OS"
      ],
      "correct": 1,
      "explanation": "PaaS provides an application platform while the customer manages its deployed application and associated data."
    },
    {
      "id": "CCSP-006",
      "track": "ccsp",
      "topic": "1. Cloud Concepts, Architecture and Design",
      "source": "nist_cloud",
      "prompt": "Which deployment model combines distinct private and public clouds with mechanisms connecting them?",
      "options": [
        "Hybrid cloud",
        "Private cloud only",
        "Community cloud only",
        "A single public-cloud account"
      ],
      "correct": 0,
      "explanation": "Hybrid combines distinct cloud infrastructures while enabling integration between them."
    },
    {
      "id": "CCSP-007",
      "track": "ccsp",
      "topic": "1. Cloud Concepts, Architecture and Design",
      "source": "nist_privacy",
      "prompt": "Before migrating a regulated workload, what should drive cloud control selection?",
      "options": [
        "The interface with the fewest configuration options alone",
        "The largest advertised virtual machine alone",
        "The provider with the lowest storage price alone",
        "Business requirements, data sensitivity, threats, and applicable obligations"
      ],
      "correct": 3,
      "explanation": "A defensible cloud design begins with the organization's workload, security, privacy, and risk requirements."
    },
    {
      "id": "CCSP-008",
      "track": "ccsp",
      "topic": "1. Cloud Concepts, Architecture and Design",
      "source": "nist_privacy",
      "prompt": "A company may need to leave its provider in two years. Which design consideration addresses this risk?",
      "options": [
        "Increasing proprietary dependencies without documentation",
        "Assuming provider bankruptcy cannot happen",
        "Portability, export formats, and tested exit procedures",
        "Replacing backup testing with an uptime dashboard"
      ],
      "correct": 2,
      "explanation": "Exit capability and portability reduce lock-in risk and support continuity during provider changes."
    },
    {
      "id": "CCSP-009",
      "track": "ccsp",
      "topic": "1. Cloud Concepts, Architecture and Design",
      "source": "zero",
      "prompt": "An internal workload requests a sensitive service. What aligns with zero trust?",
      "options": [
        "Authenticate and authorize the request rather than trusting network location alone",
        "Remove access checks after the first successful login",
        "Grant access because both systems are on the same subnet",
        "Treat every private IP address as an administrator"
      ],
      "correct": 0,
      "explanation": "Zero trust does not grant implicit trust solely from network placement or ownership."
    },
    {
      "id": "CCSP-010",
      "track": "ccsp",
      "topic": "1. Cloud Concepts, Architecture and Design",
      "source": "outline",
      "prompt": "A provider supplies an AI service. Which responsibility must a customer still evaluate?",
      "options": [
        "Only the provider's office access badges",
        "No customer responsibility after procurement",
        "Only the color of the model dashboard",
        "Its training or input data, model configuration, and allowed use of outputs"
      ],
      "correct": 3,
      "explanation": "AI workloads extend shared-responsibility analysis to customer-controlled data and application behavior."
    },
    {
      "id": "CCSP-011",
      "track": "ccsp",
      "topic": "2. Cloud Data Security",
      "source": "outline",
      "prompt": "Sensitive data is about to enter a new cloud analytics pipeline. What is the best first information-governance step?",
      "options": [
        "Delete the retention policy",
        "Assume all data has the same sensitivity",
        "Encrypt every field with an undocumented custom algorithm",
        "Discover and classify the data and identify its flows"
      ],
      "correct": 3,
      "explanation": "Discovery, classification, and flow understanding inform appropriate controls across the data lifecycle."
    },
    {
      "id": "CCSP-012",
      "track": "ccsp",
      "topic": "2. Cloud Data Security",
      "source": "crypto",
      "prompt": "Which statement best distinguishes encryption from hashing?",
      "options": [
        "Encryption and hashing are interchangeable access-control systems",
        "Hashing always conceals short predictable values from guessing",
        "Hashing is a form of reversible encryption",
        "Encryption can be reversed with appropriate keys; a cryptographic hash is not intended to be reversed"
      ],
      "correct": 3,
      "explanation": "Encryption protects confidentiality; hashes support integrity checks but predictable inputs may still be guessed."
    },
    {
      "id": "CCSP-013",
      "track": "ccsp",
      "topic": "2. Cloud Data Security",
      "source": "secrets",
      "prompt": "An application stores its data-encryption key beside its encrypted data under the same broad access permissions. What is the main concern?",
      "options": [
        "One compromise could expose both ciphertext and the key",
        "The key automatically becomes longer",
        "The data loses all availability guarantees immediately",
        "The encrypted data becomes impossible to back up"
      ],
      "correct": 0,
      "explanation": "Key separation and restricted key access reduce the chance that a data-store compromise also exposes decryption capability."
    },
    {
      "id": "CCSP-014",
      "track": "ccsp",
      "topic": "2. Cloud Data Security",
      "source": "outline",
      "prompt": "A payment system replaces sensitive account values with surrogate values linked through a protected vault. Which technique fits?",
      "options": [
        "Compression",
        "Tokenization",
        "Network address translation",
        "Hashing every database table name"
      ],
      "correct": 1,
      "explanation": "Tokenization substitutes surrogate values while protecting the mapping to the originals."
    },
    {
      "id": "CCSP-015",
      "track": "ccsp",
      "topic": "2. Cloud Data Security",
      "source": "outline",
      "prompt": "A team wants to detect sensitive files being sent to unauthorized external destinations. Which control is most directly relevant?",
      "options": [
        "A software licensing inventory alone",
        "Data loss prevention",
        "A CPU capacity dashboard",
        "A DNS availability check alone"
      ],
      "correct": 1,
      "explanation": "DLP can identify sensitive data and enforce rules against unauthorized movement or disclosure."
    },
    {
      "id": "CCSP-016",
      "track": "ccsp",
      "topic": "2. Cloud Data Security",
      "source": "sanitize",
      "prompt": "A provider says deleting a file pointer permanently removes the underlying data. What is the best response?",
      "options": [
        "Disable encryption to speed deletion",
        "Accept a screenshot as proof that all media was destroyed",
        "Assume logical deletion always sanitizes every copy",
        "Assess media sanitization and data remanence, including replicas and backups"
      ],
      "correct": 3,
      "explanation": "Logical deletion does not necessarily render stored data unrecoverable; sanitization requires appropriate methods and verification."
    },
    {
      "id": "CCSP-017",
      "track": "ccsp",
      "topic": "2. Cloud Data Security",
      "source": "sanitize",
      "prompt": "When is cryptographic erase a defensible sanitization approach?",
      "options": [
        "Whenever any one password is changed",
        "Whenever a filename is renamed",
        "When appropriate encryption protected the target data and all relevant decryption keys are securely eliminated",
        "Whenever a disk is disconnected temporarily"
      ],
      "correct": 2,
      "explanation": "Cryptographic erase depends on suitable prior encryption and reliable elimination of keys capable of recovering the data."
    },
    {
      "id": "CCSP-018",
      "track": "ccsp",
      "topic": "2. Cloud Data Security",
      "source": "nist_privacy",
      "prompt": "A company moves data to a different cloud region. Which question matters most for data governance?",
      "options": [
        "Whether the new region uses the same marketing slogan",
        "Whether a different browser color theme is available",
        "Which jurisdictions, access conditions, and obligations apply to all relevant copies and processing?",
        "Whether all legal obligations automatically cease after migration"
      ],
      "correct": 2,
      "explanation": "Location and cross-border processing can affect privacy, access, and legal obligations."
    },
    {
      "id": "CCSP-019",
      "track": "ccsp",
      "topic": "2. Cloud Data Security",
      "source": "logging",
      "prompt": "An investigation needs to prove how evidence changed hands. Which practice directly supports this?",
      "options": [
        "Documented chain of custody with integrity verification",
        "Editing the original evidence to simplify analysis",
        "Using only unsynchronized local timestamps",
        "Copying files repeatedly without recording who handled them"
      ],
      "correct": 0,
      "explanation": "Chain of custody and integrity checks help demonstrate the provenance and handling of evidence."
    },
    {
      "id": "CCSP-020",
      "track": "ccsp",
      "topic": "2. Cloud Data Security",
      "source": "outline",
      "prompt": "A training dataset contains confidential customer records. What should precede using it in an external AI service?",
      "options": [
        "Upload it because AI training is always exempt from privacy duties",
        "Remove all data classification labels",
        "Assume model weights can never reveal training information",
        "Evaluate authorized use, privacy, minimization, and provider handling of the data"
      ],
      "correct": 3,
      "explanation": "AI dataset use needs security and privacy review; training does not remove data-protection obligations."
    },
    {
      "id": "CCSP-021",
      "track": "ccsp",
      "topic": "3. Cloud Platform and Infrastructure Security",
      "source": "aws_shared",
      "prompt": "Which IaaS control is usually implemented by the cloud provider?",
      "options": [
        "The customer's guest OS configuration",
        "Physical protection and maintenance of its data-center hardware",
        "The customer's application-level account approvals",
        "The customer's database query authorization"
      ],
      "correct": 1,
      "explanation": "The provider protects the underlying infrastructure; customer-controlled workload configuration remains a separate responsibility."
    },
    {
      "id": "CCSP-022",
      "track": "ccsp",
      "topic": "3. Cloud Platform and Infrastructure Security",
      "source": "zero",
      "prompt": "Why isolate management-plane access from ordinary application traffic?",
      "options": [
        "A management-plane compromise can change or control cloud resources",
        "Management APIs are harmless because they do not serve business pages",
        "Management traffic can never contain sensitive operations",
        "Isolation makes every administrative account unnecessary"
      ],
      "correct": 0,
      "explanation": "Administrative interfaces deserve strong authentication, authorization, and constrained access because of their broad impact."
    },
    {
      "id": "CCSP-023",
      "track": "ccsp",
      "topic": "3. Cloud Platform and Infrastructure Security",
      "source": "zero",
      "prompt": "An attacker compromises one workload. Which control most directly limits movement to unrelated workloads?",
      "options": [
        "Putting all services in one unrestricted security group",
        "Segmentation and narrowly allowed service communications",
        "Disabling internal telemetry",
        "Granting all workloads the same administrator credential"
      ],
      "correct": 1,
      "explanation": "Segmentation and least-privilege communications limit lateral movement and blast radius."
    },
    {
      "id": "CCSP-024",
      "track": "ccsp",
      "topic": "3. Cloud Platform and Infrastructure Security",
      "source": "bcdr",
      "prompt": "What does Recovery Time Objective describe?",
      "options": [
        "The number of daily backups",
        "The acceptable amount of lost data measured in time",
        "The annual probability of a breach",
        "The target maximum time to restore an interrupted service"
      ],
      "correct": 3,
      "explanation": "RTO concerns restoration time. RPO concerns the point in time to which data must be recovered."
    },
    {
      "id": "CCSP-025",
      "track": "ccsp",
      "topic": "3. Cloud Platform and Infrastructure Security",
      "source": "bcdr",
      "prompt": "What does Recovery Point Objective describe?",
      "options": [
        "The service's CPU utilization",
        "The maximum time to restore user access",
        "The time required to rotate every certificate",
        "The acceptable recovery point and associated amount of data loss measured in time"
      ],
      "correct": 3,
      "explanation": "RPO measures the tolerated data-loss interval relative to an incident."
    },
    {
      "id": "CCSP-026",
      "track": "ccsp",
      "topic": "3. Cloud Platform and Infrastructure Security",
      "source": "bcdr",
      "prompt": "A business tolerates 15 minutes of lost data. Which requirement should drive backup or replication design?",
      "options": [
        "An RPO no greater than 15 minutes",
        "An RTO of exactly 15 days",
        "A log-retention period of 15 minutes",
        "A patch cycle of 15 months"
      ],
      "correct": 0,
      "explanation": "Recovery mechanisms should meet the tolerated data-loss interval; an RTO alone does not specify it."
    },
    {
      "id": "CCSP-027",
      "track": "ccsp",
      "topic": "3. Cloud Platform and Infrastructure Security",
      "source": "bcdr",
      "prompt": "A replicated database propagates an accidental deletion to its replica. What lesson follows?",
      "options": [
        "Replication guarantees recovery from every logical error",
        "Only physical disk failures matter",
        "Backups are never needed if multiple regions exist",
        "Replication alone is insufficient protection against logical corruption or deletion"
      ],
      "correct": 3,
      "explanation": "A usable recovery strategy needs suitable recovery points and tested restoration, not only live replicas."
    },
    {
      "id": "CCSP-028",
      "track": "ccsp",
      "topic": "3. Cloud Platform and Infrastructure Security",
      "source": "bcdr",
      "prompt": "A provider advertises high availability. How should a customer validate its own disaster recovery readiness?",
      "options": [
        "Count availability zones without testing",
        "Assume the provider's SLA proves application recovery",
        "Test restoration and failover against business recovery requirements",
        "Check only that a backup job starts"
      ],
      "correct": 2,
      "explanation": "Availability commitments do not prove that the customer's application can restore data and dependencies within its objectives."
    },
    {
      "id": "CCSP-029",
      "track": "ccsp",
      "topic": "3. Cloud Platform and Infrastructure Security",
      "source": "csa",
      "prompt": "What is a central security concern in multitenant infrastructure?",
      "options": [
        "Maintaining isolation between tenants and workloads",
        "Turning off management-plane authorization",
        "Requiring all tenants to share one encryption key",
        "Giving every tenant unrestricted shared storage access"
      ],
      "correct": 0,
      "explanation": "Resource sharing requires controls that maintain logical separation and prevent unauthorized cross-tenant access."
    },
    {
      "id": "CCSP-030",
      "track": "ccsp",
      "topic": "3. Cloud Platform and Infrastructure Security",
      "source": "outline",
      "prompt": "An AI training cluster handles highly sensitive data. Which infrastructure design is strongest?",
      "options": [
        "Public storage with an obscure object name",
        "Unrestricted cluster-to-cluster access for performance",
        "One shared administrator key in every training script",
        "Isolated workloads, restricted administration, protected keys, and controlled data access"
      ],
      "correct": 3,
      "explanation": "AI workloads require the same isolation and administration controls as other sensitive cloud workloads, adapted to their data and compute needs."
    },
    {
      "id": "CCSP-031",
      "track": "ccsp",
      "topic": "4. Cloud Application Security",
      "source": "threat",
      "prompt": "When should threat modeling first influence an application's design?",
      "options": [
        "Only after all features are permanently frozen",
        "Early enough to shape requirements and architecture, then throughout changes",
        "Only after a production breach",
        "Only during provider contract renewal"
      ],
      "correct": 1,
      "explanation": "Threat modeling identifies assets, trust boundaries, threats, and mitigations before decisions become expensive to change."
    },
    {
      "id": "CCSP-032",
      "track": "ccsp",
      "topic": "4. Cloud Application Security",
      "source": "testing",
      "prompt": "Which activity is Static Application Security Testing?",
      "options": [
        "Manually approving a production deployment",
        "Sending attack requests to the running application",
        "Analyzing source or compiled code without executing the application",
        "Measuring the provider's HVAC temperature"
      ],
      "correct": 2,
      "explanation": "SAST analyzes code artifacts; DAST examines behavior of a running application."
    },
    {
      "id": "CCSP-033",
      "track": "ccsp",
      "topic": "4. Cloud Application Security",
      "source": "testing",
      "prompt": "Which activity is Dynamic Application Security Testing?",
      "options": [
        "Inspecting only source-code text",
        "Testing the running application through its exposed interfaces",
        "Reviewing only the development team's access badges",
        "Checking only open-source licenses"
      ],
      "correct": 1,
      "explanation": "DAST exercises a live application to identify vulnerabilities observable in its behavior."
    },
    {
      "id": "CCSP-034",
      "track": "ccsp",
      "topic": "4. Cloud Application Security",
      "source": "component",
      "prompt": "A build includes third-party libraries. Which practice directly evaluates their dependency risks?",
      "options": [
        "Turning off CI logging",
        "Renaming all package files",
        "Disk defragmentation",
        "Software composition analysis"
      ],
      "correct": 3,
      "explanation": "SCA identifies third-party components and associated vulnerability or licensing risks."
    },
    {
      "id": "CCSP-035",
      "track": "ccsp",
      "topic": "4. Cloud Application Security",
      "source": "authorization",
      "prompt": "A user changes an object ID in an API request and reads another customer's record. Which missing control is most directly implicated?",
      "options": [
        "A faster load balancer",
        "A longer hostname",
        "Additional CSS validation",
        "Object-level authorization"
      ],
      "correct": 3,
      "explanation": "The API must authorize the caller's access to the particular object, not merely authenticate the user."
    },
    {
      "id": "CCSP-036",
      "track": "ccsp",
      "topic": "4. Cloud Application Security",
      "source": "rest",
      "prompt": "An API accepts a token but does not verify its signature or applicable claims. What is the main concern?",
      "options": [
        "The API can no longer return JSON",
        "Untrusted tokens could be accepted as proof of identity or access",
        "The token is automatically converted into a secure session",
        "The API becomes immune to replay"
      ],
      "correct": 1,
      "explanation": "Tokens must be validated according to the scheme, including signature and relevant issuer, audience, and expiry checks."
    },
    {
      "id": "CCSP-037",
      "track": "ccsp",
      "topic": "4. Cloud Application Security",
      "source": "authorization",
      "prompt": "Why is hiding an administrative button insufficient access control?",
      "options": [
        "The browser alone is a trusted policy decision point",
        "Authorization must be enforced on the protected server operation",
        "Client HTML always proves the user's permissions",
        "Hidden buttons prevent all direct API requests"
      ],
      "correct": 1,
      "explanation": "Users can call APIs directly; permissions must be checked where resources and operations are protected."
    },
    {
      "id": "CCSP-038",
      "track": "ccsp",
      "topic": "4. Cloud Application Security",
      "source": "secrets",
      "prompt": "What is the best way for a workload to obtain cloud credentials where supported?",
      "options": [
        "Commit a long-lived administrator secret to source control",
        "Include production keys in a public container image",
        "Reuse a developer's personal password across every service",
        "Use workload identity or short-lived, narrowly scoped credentials"
      ],
      "correct": 3,
      "explanation": "Workload identity and short-lived credentials reduce exposure and simplify revocation compared with embedded long-lived secrets."
    },
    {
      "id": "CCSP-039",
      "track": "ccsp",
      "topic": "4. Cloud Application Security",
      "source": "rest",
      "prompt": "What role does a web application firewall serve?",
      "options": [
        "A guarantee that dependencies contain no vulnerabilities",
        "A replacement for all authorization and secure coding",
        "A replacement for customer identity management",
        "A supplementary layer for detecting or blocking certain malicious web requests"
      ],
      "correct": 3,
      "explanation": "A WAF can reduce some web attack exposure but does not remove application design and implementation responsibilities."
    },
    {
      "id": "CCSP-040",
      "track": "ccsp",
      "topic": "4. Cloud Application Security",
      "source": "authorization",
      "prompt": "An AI agent reads an untrusted document containing instructions to export secrets. Which architecture best limits impact?",
      "options": [
        "Treat retrieved content as untrusted and enforce tool permissions outside the model",
        "Disable all auditing to reduce token use",
        "Give the model administrator rights so it can decide freely",
        "Rely only on a hidden system prompt while granting broad tool access"
      ],
      "correct": 0,
      "explanation": "Model output is not an authorization boundary. Independent access checks and constrained tools limit damage from manipulated instructions."
    },
    {
      "id": "CCSP-041",
      "track": "ccsp",
      "topic": "5. Cloud Security Operations",
      "source": "incident",
      "prompt": "What should an incident response plan establish before an incident?",
      "options": [
        "An assumption that the provider handles every customer incident",
        "An instruction to delete all logs immediately",
        "Roles, escalation paths, evidence handling, and provider coordination",
        "Only a list of product logos"
      ],
      "correct": 2,
      "explanation": "Preparation and coordination make detection, response, and recovery more effective."
    },
    {
      "id": "CCSP-042",
      "track": "ccsp",
      "topic": "5. Cloud Security Operations",
      "source": "logging",
      "prompt": "Which logging approach best supports event correlation across cloud services?",
      "options": [
        "Each system using unrecorded local time without synchronization",
        "Allowing any workload to alter all collected logs",
        "Logging only successful page loads",
        "Consistent timestamps and event identity with protected centralized collection"
      ],
      "correct": 3,
      "explanation": "Useful correlation requires consistent time and context; log integrity and restricted access preserve evidentiary value."
    },
    {
      "id": "CCSP-043",
      "track": "ccsp",
      "topic": "5. Cloud Security Operations",
      "source": "logging",
      "prompt": "Which information should generally be excluded or carefully redacted from ordinary application logs?",
      "options": [
        "Non-sensitive request correlation IDs",
        "Event timestamps",
        "Action names",
        "Passwords, access tokens, and unnecessary sensitive personal data"
      ],
      "correct": 3,
      "explanation": "Logs are another data store and should not expose reusable credentials or unnecessary sensitive records."
    },
    {
      "id": "CCSP-044",
      "track": "ccsp",
      "topic": "5. Cloud Security Operations",
      "source": "incident",
      "prompt": "A compromised workload needs containment while forensic evidence is preserved. Which action is best?",
      "options": [
        "Follow the response plan to isolate it and preserve relevant evidence before destructive changes",
        "Immediately wipe it without recording any evidence",
        "Publish all credentials to the incident ticket",
        "Leave it unrestricted indefinitely to collect more data"
      ],
      "correct": 0,
      "explanation": "Containment and evidence preservation must be coordinated according to the incident's impact and response procedures."
    },
    {
      "id": "CCSP-045",
      "track": "ccsp",
      "topic": "5. Cloud Security Operations",
      "source": "secrets",
      "prompt": "A service credential is exposed in a public repository. What is the priority response?",
      "options": [
        "Wait for the next annual audit",
        "Revoke or rotate it and investigate its use and exposure",
        "Change the repository's font size",
        "Delete the local file and assume the secret is now safe"
      ],
      "correct": 1,
      "explanation": "Removal does not undo exposure. Revocation or rotation and investigation address the compromised credential."
    },
    {
      "id": "CCSP-046",
      "track": "ccsp",
      "topic": "5. Cloud Security Operations",
      "source": "csa",
      "prompt": "A deployment changes production permissions. What operational control is most relevant?",
      "options": [
        "Reviewed change management with validation and a recovery plan",
        "Disabling configuration history",
        "Treating every emergency as an exception without documentation",
        "Allowing changes only when no one is watching"
      ],
      "correct": 0,
      "explanation": "Controlled changes improve traceability and reduce unintended production risk."
    },
    {
      "id": "CCSP-047",
      "track": "ccsp",
      "topic": "5. Cloud Security Operations",
      "source": "bcdr",
      "prompt": "What is the best evidence that backups meet recovery needs?",
      "options": [
        "The storage provider's logo",
        "A folder named latest-backup",
        "A successful restoration exercise checked against RTO and RPO",
        "A screenshot showing that a backup job is scheduled"
      ],
      "correct": 2,
      "explanation": "Recoverability must be demonstrated by restoration, including dependencies and target recovery objectives."
    },
    {
      "id": "CCSP-048",
      "track": "ccsp",
      "topic": "5. Cloud Security Operations",
      "source": "csa",
      "prompt": "What is configuration drift?",
      "options": [
        "A fixed mapping between two DNS records",
        "A deployed environment diverging from its approved configuration baseline",
        "A change in the data controller's legal name only",
        "An increase in encrypted file size"
      ],
      "correct": 1,
      "explanation": "Baseline comparison helps detect unexpected or unauthorized configuration changes."
    },
    {
      "id": "CCSP-049",
      "track": "ccsp",
      "topic": "5. Cloud Security Operations",
      "source": "incident",
      "prompt": "How do incident management and problem management differ conceptually?",
      "options": [
        "They always require identical actions and timelines",
        "Incident management is only a procurement activity",
        "Problem management means closing every alert without investigation",
        "Incident management restores service; problem management investigates underlying causes and recurrence"
      ],
      "correct": 3,
      "explanation": "Restoring service and preventing recurrence are related but distinct operational objectives."
    },
    {
      "id": "CCSP-050",
      "track": "ccsp",
      "topic": "5. Cloud Security Operations",
      "source": "outline",
      "prompt": "An automated AI-assisted response system proposes disabling a business-critical account. What governance is appropriate?",
      "options": [
        "Allow unbounded autonomous administrative actions",
        "Trust all model outputs as approved changes",
        "Remove rollback capability",
        "Defined authorization limits, auditable actions, and human review where impact requires it"
      ],
      "correct": 3,
      "explanation": "Automation needs accountable, risk-appropriate controls rather than implicit authority from a model recommendation."
    },
    {
      "id": "CCSP-051",
      "track": "ccsp",
      "topic": "6. Legal, Risk and Compliance",
      "source": "gdpr",
      "prompt": "Under the GDPR role definitions, who determines the purposes and means of personal-data processing?",
      "options": [
        "Processor acting only on documented instructions",
        "Controller",
        "Every employee as an independent controller",
        "Storage hardware supplier automatically"
      ],
      "correct": 1,
      "explanation": "The controller decides why and how personal data is processed; a processor acts on behalf of the controller."
    },
    {
      "id": "CCSP-052",
      "track": "ccsp",
      "topic": "6. Legal, Risk and Compliance",
      "source": "gdpr",
      "prompt": "A cloud provider processes payroll data only on behalf of a customer according to instructions. Which role describes that activity?",
      "options": [
        "Processor",
        "Independent controller for that activity automatically",
        "Data subject",
        "Supervisory authority"
      ],
      "correct": 0,
      "explanation": "A provider may act as a processor for the described activity. Actual roles depend on the specific processing, not only a contract label."
    },
    {
      "id": "CCSP-053",
      "track": "ccsp",
      "topic": "6. Legal, Risk and Compliance",
      "source": "nist_privacy",
      "prompt": "A cloud region is in one country, backups are elsewhere, and administrators operate globally. What must a privacy review consider?",
      "options": [
        "Only the region's name in the marketing page",
        "Only the customer's registered office",
        "Only the app's display language",
        "Relevant processing locations, access paths, subprocessors, and cross-border obligations"
      ],
      "correct": 3,
      "explanation": "Privacy and legal risk analysis must consider actual processing and access, not just the primary storage region."
    },
    {
      "id": "CCSP-054",
      "track": "ccsp",
      "topic": "6. Legal, Risk and Compliance",
      "source": "outline",
      "prompt": "A dataset is subject to an active legal hold. What is the best retention decision?",
      "options": [
        "Erase only backups without review",
        "Preserve the affected data under the hold and coordinate with authorized legal personnel",
        "Automatically delete it when the ordinary retention period ends",
        "Move it to another region to avoid the hold"
      ],
      "correct": 1,
      "explanation": "Legal holds can suspend routine deletion for affected information until the hold is properly released."
    },
    {
      "id": "CCSP-055",
      "track": "ccsp",
      "topic": "6. Legal, Risk and Compliance",
      "source": "assurance",
      "prompt": "A provider offers an audit report. What should a customer assess before relying on it?",
      "options": [
        "Whether the report eliminates the need for access reviews",
        "Only whether the report uses the provider's current logo",
        "Report scope, relevant services and regions, period, findings, and customer control responsibilities",
        "Whether the report guarantees every customer's compliance"
      ],
      "correct": 2,
      "explanation": "Assurance evidence supports due diligence only when its coverage and limitations match the workload."
    },
    {
      "id": "CCSP-056",
      "track": "ccsp",
      "topic": "6. Legal, Risk and Compliance",
      "source": "nist_privacy",
      "prompt": "A vendor contract lacks data-export and deletion terms at termination. What risk should be addressed?",
      "options": [
        "A guarantee of improved interoperability",
        "Only the application's color scheme",
        "The elimination of data ownership concerns",
        "Exit capability and continued exposure of customer data"
      ],
      "correct": 3,
      "explanation": "Cloud outsourcing requires defined arrangements for data access, return, and disposal, including termination."
    },
    {
      "id": "CCSP-057",
      "track": "ccsp",
      "topic": "6. Legal, Risk and Compliance",
      "source": "outline",
      "prompt": "A business formally accepts a documented residual risk within its approved appetite. Which treatment is this?",
      "options": [
        "Automatic risk elimination",
        "Risk transfer",
        "Risk acceptance",
        "Risk avoidance"
      ],
      "correct": 2,
      "explanation": "Acceptance is an informed, authorized decision to retain risk; it does not claim the risk disappeared."
    },
    {
      "id": "CCSP-058",
      "track": "ccsp",
      "topic": "6. Legal, Risk and Compliance",
      "source": "nist_privacy",
      "prompt": "A company buys cyber insurance for a cloud workload. Which statement is most defensible?",
      "options": [
        "Insurance removes all data-protection duties",
        "Insurance automatically prevents all security incidents",
        "Insurance may transfer some financial impact, while operational and compliance responsibilities remain",
        "Insurance makes identity controls unnecessary"
      ],
      "correct": 2,
      "explanation": "Transferring financial impact does not eliminate the underlying risk or the organization's other responsibilities."
    },
    {
      "id": "CCSP-059",
      "track": "ccsp",
      "topic": "6. Legal, Risk and Compliance",
      "source": "gdpr",
      "prompt": "A customer delegates processing to a cloud provider. What remains important for accountability?",
      "options": [
        "Treat encryption alone as proof of lawful processing",
        "Assume delegation eliminates the customer's duties",
        "Verify suitable safeguards and establish binding processing arrangements",
        "Rely solely on the provider's product name"
      ],
      "correct": 2,
      "explanation": "The controller must ensure appropriate processing arrangements and safeguards; outsourcing does not by itself demonstrate compliance."
    },
    {
      "id": "CCSP-060",
      "track": "ccsp",
      "topic": "6. Legal, Risk and Compliance",
      "source": "outline",
      "prompt": "A company considers an AI service for sensitive decisions. What belongs in vendor due diligence?",
      "options": [
        "Only the number of model parameters",
        "Only the lowest subscription price",
        "Data handling, security controls, relevant obligations, accountability, and appropriate transparency",
        "Only benchmark speed"
      ],
      "correct": 2,
      "explanation": "AI vendor assessment must consider security, privacy, legal, and governance implications alongside functionality."
    }
  ]
};
