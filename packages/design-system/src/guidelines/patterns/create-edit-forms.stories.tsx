import { type ChangeEvent, type FormEvent, useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import {
  Alert,
  AlertContent,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from '../../components/Alert';
import { Button } from '../../components/Button';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/Dialog';
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerFooterControls,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '../../components/Drawer';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldIndicator,
  FieldLabel,
} from '../../components/Field';
import { Input } from '../../components/Input';
import { VStack } from '../../components/Stack';
import {
  Stepper,
  StepperContent,
  StepperIndicator,
  StepperItem,
  type StepperItemStatus,
  StepperList,
  StepperNextTrigger,
  StepperPrevTrigger,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from '../../components/Stepper';
import { Textarea } from '../../components/Textarea';
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from '../../components/Timeline';
import { useToast } from '../../components/Toast';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../components/Tooltip';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Stands in for the request your app sends.
const saveRequest = () => new Promise(resolve => setTimeout(resolve, 800));

const meta = {
  title: 'Patterns/Create and edit forms',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Use when building a form that creates or edits an entity, and you must choose between a Dialog, a Drawer with Timeline sections, or a Drawer with a Stepper.',
      },
    },
  },
} satisfies Meta;

export default meta;

/**
 * Up to six fields, one concern: a `Dialog` at its default 560px with a 24px field stack. Submit
 * stays disabled until the required fields are filled, the email error shows only after blur or
 * submit, and a successful request closes the dialog and shows a toast.
 */
export const CreateInDialog: StoryFn = () => {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [pending, setPending] = useState(false);

  const emailInvalid = emailTouched && !EMAIL_PATTERN.test(email.trim());
  const canSubmit = name.trim() !== '' && email.trim() !== '';

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setName('');
      setEmail('');
      setMessage('');
      setEmailTouched(false);
    }
  };
  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => setName(event.target.value);
  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value);
  const handleEmailBlur = () => setEmailTouched(true);
  const handleMessageChange = (event: ChangeEvent<HTMLTextAreaElement>) =>
    setMessage(event.target.value);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setEmailTouched(true);
    if (!EMAIL_PATTERN.test(email.trim())) return;
    setPending(true);
    await saveRequest();
    setPending(false);
    handleOpenChange(false);
    toast.create({ id: 'user-created', title: 'User created', type: 'success' });
  };

  return (
    <div className='p-24'>
      <Dialog open={open} onOpenChange={handleOpenChange} data-testid='create-user-dialog'>
        <DialogTrigger asChild>
          <Button>Create user</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create user</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className='flex min-h-0 flex-1 flex-col'>
            <DialogBody>
              <VStack gap={24}>
                <Field required>
                  <FieldLabel>
                    Full name
                    <FieldIndicator />
                  </FieldLabel>
                  <Input
                    value={name}
                    onChange={handleNameChange}
                    placeholder='Maria Lopez'
                    data-testid='create-user-name'
                  />
                </Field>
                <Field required>
                  <FieldLabel>
                    Email
                    <FieldIndicator />
                  </FieldLabel>
                  <FieldDescription>We send an invitation link to this email.</FieldDescription>
                  <Input
                    type='email'
                    value={email}
                    error={emailInvalid}
                    onChange={handleEmailChange}
                    onBlur={handleEmailBlur}
                    placeholder='maria.lopez@acme-bank.com'
                    data-testid='create-user-email'
                  />
                  {emailInvalid && (
                    <FieldError data-testid='create-user-email-error'>
                      Enter an email address.
                    </FieldError>
                  )}
                </Field>
                <Field>
                  <FieldLabel>
                    Message
                    <FieldIndicator />
                  </FieldLabel>
                  <Textarea
                    value={message}
                    onChange={handleMessageChange}
                    placeholder='Added to the SOC on-call rotation.'
                  />
                </Field>
              </VStack>
            </DialogBody>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant='ghost' color='neutral'>
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type='submit'
                disabled={!canSubmit}
                loading={pending}
                data-testid='create-user-submit'
              >
                Create user
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const USER = {
  id: 'u-1043',
  name: 'Daniel Okafor',
  email: 'daniel.okafor@acme-bank.com',
};

/**
 * Edit uses the same container as create: fields are prefilled, "Save changes" stays disabled
 * until a value changes, and the user ID, fixed after create, is disabled with a tooltip on a
 * wrapping `span`.
 */
export const EditInDialog: StoryFn = () => {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(USER.name);
  const [email, setEmail] = useState(USER.email);
  const [pending, setPending] = useState(false);

  const dirty = name !== USER.name || email !== USER.email;
  const canSubmit = dirty && name.trim() !== '' && EMAIL_PATTERN.test(email.trim());

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setName(USER.name);
      setEmail(USER.email);
    }
  };
  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => setName(event.target.value);
  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    await saveRequest();
    setPending(false);
    setOpen(false);
    toast.create({ id: 'user-updated', title: 'User updated', type: 'success' });
  };

  return (
    <div className='p-24'>
      <Dialog open={open} onOpenChange={handleOpenChange} data-testid='edit-user-dialog'>
        <DialogTrigger asChild>
          <Button variant='outline' color='neutral'>
            Edit user
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className='flex min-h-0 flex-1 flex-col'>
            <DialogBody>
              <VStack gap={24}>
                <Field required>
                  <FieldLabel>
                    User ID
                    <FieldIndicator />
                  </FieldLabel>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Input value={USER.id} disabled data-testid='edit-user-id' />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>The ID can't change after the user is created.</TooltipContent>
                  </Tooltip>
                </Field>
                <Field required>
                  <FieldLabel>
                    Full name
                    <FieldIndicator />
                  </FieldLabel>
                  <Input value={name} onChange={handleNameChange} data-testid='edit-user-name' />
                </Field>
                <Field required>
                  <FieldLabel>
                    Email
                    <FieldIndicator />
                  </FieldLabel>
                  <Input type='email' value={email} onChange={handleEmailChange} />
                </Field>
              </VStack>
            </DialogBody>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant='ghost' color='neutral'>
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type='submit'
                disabled={!canSubmit}
                loading={pending}
                data-testid='edit-user-submit'
              >
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/**
 * Dependent sections seen together: a `Drawer width={700}` with numbered `Timeline` sections and
 * 12px field stacks. Short related fields share a two-column row; URLs and secrets get full
 * width. "Test connection" reports in its section with an `Alert`, never a toast.
 */
export const CreateInDrawerWithSections: StoryFn = () => {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [domain, setDomain] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [testing, setTesting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [pending, setPending] = useState(false);

  const credentialsFilled = domain.trim() !== '' && clientId.trim() !== '' && clientSecret !== '';
  const canSubmit = name.trim() !== '' && slug.trim() !== '' && credentialsFilled;

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => setName(event.target.value);
  const handleSlugChange = (event: ChangeEvent<HTMLInputElement>) => setSlug(event.target.value);
  const handleDomainChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDomain(event.target.value);
    setConnected(false);
  };
  const handleClientIdChange = (event: ChangeEvent<HTMLInputElement>) => {
    setClientId(event.target.value);
    setConnected(false);
  };
  const handleClientSecretChange = (event: ChangeEvent<HTMLInputElement>) => {
    setClientSecret(event.target.value);
    setConnected(false);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    await saveRequest();
    setTesting(false);
    setConnected(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    await saveRequest();
    setPending(false);
    setOpen(false);
    toast.create({ id: 'provider-created', title: 'Identity provider created', type: 'success' });
  };

  return (
    <div className='p-24'>
      <Drawer open={open} onOpenChange={setOpen} width={700} data-testid='create-provider-drawer'>
        <DrawerTrigger asChild>
          <Button>Create identity provider</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Create identity provider</DrawerTitle>
          </DrawerHeader>
          <form onSubmit={handleSubmit} className='flex min-h-0 flex-1 flex-col'>
            <DrawerBody>
              <Timeline data-testid='create-provider-sections'>
                <TimelineItem>
                  <TimelineConnector>
                    <TimelineIndicator>1</TimelineIndicator>
                    <TimelineSeparator />
                  </TimelineConnector>
                  <TimelineContent>
                    <TimelineTitle>Provider details</TimelineTitle>
                    <VStack gap={12}>
                      <div className='grid grid-cols-2 gap-12'>
                        <Field required>
                          <FieldLabel>
                            Name
                            <FieldIndicator />
                          </FieldLabel>
                          <Input value={name} onChange={handleNameChange} placeholder='Okta SSO' />
                        </Field>
                        <Field required>
                          <FieldLabel>
                            Provider ID
                            <FieldIndicator />
                          </FieldLabel>
                          <Input value={slug} onChange={handleSlugChange} placeholder='okta-sso' />
                        </Field>
                      </div>
                    </VStack>
                  </TimelineContent>
                </TimelineItem>
                <TimelineItem>
                  <TimelineConnector>
                    <TimelineIndicator>2</TimelineIndicator>
                    <TimelineSeparator />
                  </TimelineConnector>
                  <TimelineContent>
                    <TimelineTitle>Okta connection</TimelineTitle>
                    <VStack gap={12}>
                      <Field required>
                        <FieldLabel>
                          Okta domain
                          <FieldIndicator />
                        </FieldLabel>
                        <Input
                          value={domain}
                          onChange={handleDomainChange}
                          placeholder='https://acme-bank.okta.com'
                          data-testid='create-provider-domain'
                        />
                      </Field>
                      <Field required>
                        <FieldLabel>
                          Client ID
                          <FieldIndicator />
                        </FieldLabel>
                        <Input
                          value={clientId}
                          onChange={handleClientIdChange}
                          data-testid='create-provider-client-id'
                        />
                      </Field>
                      <Field required>
                        <FieldLabel>
                          Client secret
                          <FieldIndicator />
                        </FieldLabel>
                        <FieldDescription>
                          Stored encrypted; you can't view it again.
                        </FieldDescription>
                        <Input
                          type='password'
                          value={clientSecret}
                          onChange={handleClientSecretChange}
                          data-testid='create-provider-client-secret'
                        />
                      </Field>
                      <div>
                        <Button
                          variant='outline'
                          color='neutral'
                          disabled={!credentialsFilled}
                          loading={testing}
                          onClick={handleTestConnection}
                          data-testid='create-provider-test'
                        >
                          Test connection
                        </Button>
                      </div>
                      {connected && (
                        <Alert color='success' data-testid='create-provider-test-result'>
                          <AlertIcon />
                          <AlertContent>
                            <AlertTitle>Connected to Okta</AlertTitle>
                            <AlertDescription>
                              Wallarm reached acme-bank.okta.com with these credentials.
                            </AlertDescription>
                          </AlertContent>
                        </Alert>
                      )}
                    </VStack>
                  </TimelineContent>
                </TimelineItem>
              </Timeline>
            </DrawerBody>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant='ghost' color='neutral'>
                  Cancel
                </Button>
              </DrawerClose>
              <Button
                type='submit'
                disabled={!canSubmit}
                loading={pending}
                data-testid='create-provider-submit'
              >
                Create identity provider
              </Button>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

const POLICY_STEPS = ['General', 'Scope', 'Limit'] as const;

/**
 * Gated parts: a `Drawer` at its default 640px with a `Stepper` wrapping body and footer. Cancel
 * sits left, Back and Next right; on the last step submit replaces Next. Steps never block: a
 * step left with empty required fields turns `danger`, a filled one `completed`.
 */
export const CreateInDrawerWithSteps: StoryFn = () => {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [host, setHost] = useState('');
  const [path, setPath] = useState('');
  const [rps, setRps] = useState('');
  const [pending, setPending] = useState(false);
  const [visited, setVisited] = useState<number[]>([]);

  const valid = [name.trim() !== '', host.trim() !== '' && path.trim() !== '', rps.trim() !== ''];
  const statuses = valid.map<StepperItemStatus>((ok, i) =>
    !visited.includes(i) ? 'upcoming' : ok ? 'completed' : 'danger',
  );
  const last = step === POLICY_STEPS.length - 1;

  const handleStepChange = ({ step: next }: { step: number }) => {
    setVisited(prev => (prev.includes(step) ? prev : [...prev, step]));
    setStep(next);
  };
  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => setName(event.target.value);
  const handleDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) =>
    setDescription(event.target.value);
  const handleHostChange = (event: ChangeEvent<HTMLInputElement>) => setHost(event.target.value);
  const handlePathChange = (event: ChangeEvent<HTMLInputElement>) => setPath(event.target.value);
  const handleRpsChange = (event: ChangeEvent<HTMLInputElement>) => setRps(event.target.value);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    await saveRequest();
    setPending(false);
    setOpen(false);
    toast.create({ id: 'policy-created', title: 'Policy created', type: 'success' });
  };

  return (
    <div className='p-24'>
      <Drawer open={open} onOpenChange={setOpen} data-testid='create-policy-drawer'>
        <DrawerTrigger asChild>
          <Button>Create policy</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Create policy</DrawerTitle>
          </DrawerHeader>
          <form onSubmit={handleSubmit} className='flex min-h-0 flex-1 flex-col'>
            <Stepper
              count={POLICY_STEPS.length}
              step={step}
              onStepChange={handleStepChange}
              className='flex min-h-0 flex-1 flex-col'
              data-testid='create-policy-stepper'
            >
              <StepperList aria-label='Create policy steps'>
                {POLICY_STEPS.map((title, i) => (
                  <StepperItem key={title} index={i} status={statuses[i]}>
                    <StepperTrigger>
                      <StepperIndicator />
                      <StepperTitle>{title}</StepperTitle>
                    </StepperTrigger>
                    <StepperSeparator />
                  </StepperItem>
                ))}
              </StepperList>
              <DrawerBody>
                <StepperContent index={0} className='py-16'>
                  <VStack gap={12}>
                    <Field required>
                      <FieldLabel>
                        Name
                        <FieldIndicator />
                      </FieldLabel>
                      <Input
                        value={name}
                        onChange={handleNameChange}
                        placeholder='Login brute-force limit'
                      />
                    </Field>
                    <Field>
                      <FieldLabel>
                        Description
                        <FieldIndicator />
                      </FieldLabel>
                      <Textarea value={description} onChange={handleDescriptionChange} />
                    </Field>
                  </VStack>
                </StepperContent>
                <StepperContent index={1} className='py-16'>
                  <VStack gap={12}>
                    <div className='grid grid-cols-2 gap-12'>
                      <Field required>
                        <FieldLabel>
                          Host
                          <FieldIndicator />
                        </FieldLabel>
                        <Input
                          value={host}
                          onChange={handleHostChange}
                          placeholder='api.acme-bank.com'
                        />
                      </Field>
                      <Field required>
                        <FieldLabel>
                          Path
                          <FieldIndicator />
                        </FieldLabel>
                        <Input value={path} onChange={handlePathChange} placeholder='/v1/login' />
                      </Field>
                    </div>
                  </VStack>
                </StepperContent>
                <StepperContent index={2} className='py-16'>
                  <VStack gap={12}>
                    <Field required>
                      <FieldLabel>
                        Requests per second
                        <FieldIndicator />
                      </FieldLabel>
                      <FieldDescription>
                        Requests over the limit from one IP get a 429.
                      </FieldDescription>
                      <Input
                        type='number'
                        value={rps}
                        onChange={handleRpsChange}
                        placeholder='10'
                      />
                    </Field>
                  </VStack>
                </StepperContent>
              </DrawerBody>
              <DrawerFooter>
                <DrawerFooterControls placement='left'>
                  <DrawerClose asChild>
                    <Button variant='ghost' color='neutral'>
                      Cancel
                    </Button>
                  </DrawerClose>
                </DrawerFooterControls>
                <DrawerFooterControls placement='right'>
                  <StepperPrevTrigger asChild>
                    <Button variant='outline' color='neutral'>
                      Back
                    </Button>
                  </StepperPrevTrigger>
                  {last ? (
                    <Button
                      type='submit'
                      disabled={!valid.every(Boolean)}
                      loading={pending}
                      data-testid='create-policy-submit'
                    >
                      Create policy
                    </Button>
                  ) : (
                    <StepperNextTrigger asChild>
                      <Button>Next</Button>
                    </StepperNextTrigger>
                  )}
                </DrawerFooterControls>
              </DrawerFooter>
            </Stepper>
          </form>
        </DrawerContent>
      </Drawer>
    </div>
  );
};
