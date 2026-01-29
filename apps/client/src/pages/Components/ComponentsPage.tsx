import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from '@tanstack/react-form';
import { type ColumnDef } from '@tanstack/react-table';
import {
  Bold,
  ClipboardList,
  FileSignature,
  FolderKanban,
  Italic,
  LayoutDashboard,
  Mail,
  Plus,
  Receipt,
  ReceiptText,
  Users,
  Settings,
  Underline,
} from 'lucide-react';
import { z } from 'zod';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  ExternalLink,
  Input,
  Select,
  Tooltip,
} from '@/components/atoms';
import {
  ButtonWithSpinner,
  ConfirmDialog,
  DropdownMenu,
  InputWithHelper,
  SheetPanel,
  Tabs,
  UserAvatar,
} from '@/components/molecules';
import {
  DataTable,
  EmptyState,
  PageHeader,
  SectionCard,
} from '@/components/organisms';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Toggle } from '@/components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { toast } from '@/utils';
import { MainPageLayout } from '@/templates';
import { useConfirmDialog } from '@/hooks';
import { cn } from '@/lib/utils';

export const ComponentsPage = () => {
  const { t } = useTranslation(['translation', 'common']);
  const [name, setName] = useState('');
  const [selectedFramework, setSelectedFramework] = useState('react');
  const [agree, setAgree] = useState(false);
  const [toggleValue, setToggleValue] = useState(false);
  const [toggleGroupValue, setToggleGroupValue] = useState('left');
  const [switchChecked, setSwitchChecked] = useState(true);
  const [radioValue, setRadioValue] = useState('email');
  const [otpValue, setOtpValue] = useState('');

  const SidebarDemoContent = () => {
    const { open } = useSidebar();
    const isExpanded = open;
    const paddingLeft = isExpanded
      ? 'var(--sidebar-width)'
      : '0px';
    return (
      <div
        className="flex-1 transition-all"
        style={{ paddingLeft }}
      >
        <div className="flex h-full flex-col">
          <div className="border-b px-4 py-3 text-sm font-semibold">
            {t('Components.Organisms.SidebarDemo.ContentTitle')}
          </div>
          <div className="flex-1 p-4 text-sm text-muted-foreground">
            {t('Components.Organisms.SidebarDemo.ContentDescription')}
          </div>
        </div>
      </div>
    );
  };

  const SidebarDemoSidebar = () => {
    const { open } = useSidebar();
    const left = 'calc(var(--sidebar-rail-width) - 2px)';
    const translateX = open
      ? 'translateX(0)'
      : 'translateX(calc(var(--sidebar-width) * -1 - var(--sidebar-rail-width)))';
    return (
      <div
        className="absolute inset-y-0 z-10 w-[--sidebar-width] overflow-hidden transition-transform duration-200 ease-linear"
        style={{ left, transform: translateX }}
      >
        <Sidebar collapsible="none" className="h-full w-full">
          <SidebarHeader>
            <div className="px-2 text-xs font-semibold uppercase text-muted-foreground">
              {t('Components.Organisms.SidebarDemo.NavLabel')}
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {[
                    {
                      label: t('Components.Organisms.SidebarDemo.ItemDashboard'),
                      icon: LayoutDashboard,
                    },
                    {
                      label: t('Components.Organisms.SidebarDemo.ItemProjects'),
                      icon: FolderKanban,
                    },
                    {
                      label: t('Components.Organisms.SidebarDemo.ItemReports'),
                      icon: Mail,
                    },
                    {
                      label: t('Components.Organisms.SidebarDemo.ItemSettings'),
                      icon: Settings,
                    },
                  ].map(item => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton asChild>
                        <button type="button" className="flex items-center gap-2">
                          <item.icon className="size-4" />
                          <span>{item.label}</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="mt-auto">
            <Button size="sm" className="w-full">
              <Plus className="size-4" />
              <span>{t('Components.Organisms.SidebarDemo.PrimaryAction')}</span>
            </Button>
          </SidebarFooter>
        </Sidebar>
      </div>
    );
  };

  const SidebarDemoRail = () => {
    return (
      <div
        className={cn(
          'z-20 flex w-[--sidebar-rail-width] shrink-0 flex-col items-center gap-2 border-r bg-muted/5 py-3 transition-all'
        )}
      >
        {[
          {
            label: t('Components.Organisms.SidebarDemo.RailDashboard'),
            icon: LayoutDashboard,
          },
          {
            label: t('Components.Organisms.SidebarDemo.RailIncomingInvoices'),
            icon: Receipt,
          },
          {
            label: t('Components.Organisms.SidebarDemo.RailContracts'),
            icon: FileSignature,
          },
          {
            label: t('Components.Organisms.SidebarDemo.RailRequests'),
            icon: ClipboardList,
          },
          {
            label: t('Components.Organisms.SidebarDemo.RailOutgoingInvoices'),
            icon: ReceiptText,
          },
          {
            label: t('Components.Organisms.SidebarDemo.RailUsers'),
            icon: Users,
          },
        ].map(item => (
          <Tooltip key={item.label} content={item.label}>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <item.icon className="size-4" />
            </button>
          </Tooltip>
        ))}
      </div>
    );
  };
  const { dialogState, showConfirm, hideConfirm, handleConfirm } =
    useConfirmDialog();

  type TanStackFormValues = {
    fullName: string;
    email: string;
    message: string;
  };

  const fieldSchemas: Record<keyof TanStackFormValues, z.ZodTypeAny> = {
    fullName: z
      .string()
      .trim()
      .min(1, t('Pages.Components.TanStackForm.NameRequired')),
    email: z
      .string()
      .trim()
      .min(1, t('Pages.Components.TanStackForm.EmailRequired'))
      .email(t('Pages.Components.TanStackForm.EmailInvalid')),
    message: z
      .string()
      .trim()
      .min(10, t('Pages.Components.TanStackForm.MessageMin')),
  };

  const formSchema = z.object(fieldSchemas);

  const validateField = <K extends keyof TanStackFormValues>(
    key: K,
    value: TanStackFormValues[K]
  ) => {
    const result = fieldSchemas[key].safeParse(value);
    return result.success ? undefined : result.error.issues[0]?.message;
  };

  const form = useForm<
    TanStackFormValues,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined
  >({
    defaultValues: {
      fullName: '',
      email: '',
      message: '',
    },
    onSubmit: async ({ value }: { value: TanStackFormValues }) => {
      const parsed = formSchema.safeParse(value);
      if (!parsed.success) {
        toast({
          title: t('Pages.Components.TanStackForm.EmailInvalid'),
          description: parsed.error.issues[0]?.message,
          variant: 'error',
        });
        return;
      }

      toast({
        title: t('Pages.Components.TanStackForm.SuccessTitle'),
        description: t('Pages.Components.TanStackForm.SuccessDescription', {
          name: parsed.data.fullName,
        }),
        variant: 'success',
      });

      form.reset();
    },
  });

  type DemoRow = {
    name: string;
    email: string;
    role: string;
    status: string;
  };

  const demoData: DemoRow[] = useMemo(
    () => [
      {
        name: 'Alex Lee',
        email: 'alex@example.com',
        role: 'Admin',
        status: t('Components.Organisms.DataTable.StatusActive'),
      },
      {
        name: 'Sam Doe',
        email: 'sam@example.com',
        role: 'Editor',
        status: t('Components.Organisms.DataTable.StatusPending'),
      },
      {
        name: 'Casey Lin',
        email: 'casey@example.com',
        role: 'Viewer',
        status: t('Components.Organisms.DataTable.StatusInactive'),
      },
    ],
    [t]
  );

  const demoColumns = useMemo<ColumnDef<DemoRow>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('Components.Organisms.DataTable.Headers.Name'),
      },
      {
        accessorKey: 'email',
        header: t('Components.Organisms.DataTable.Headers.Email'),
      },
      {
        accessorKey: 'role',
        header: t('Components.Organisms.DataTable.Headers.Role'),
      },
      {
        accessorKey: 'status',
        header: t('Components.Organisms.DataTable.Headers.Status'),
        cell: info => {
          const value = String(info.getValue());
          const isActive = value === t('Components.Organisms.DataTable.StatusActive');
          const isPending = value === t('Components.Organisms.DataTable.StatusPending');
          const variant = isActive ? 'secondary' : isPending ? 'outline' : 'destructive';
          return <Badge variant={variant}>{value}</Badge>;
        },
      },
    ],
    [t]
  );

  return (
    <MainPageLayout>
      <div className="space-y-10">
        <PageHeader
          title={t('Pages.Components.Title')}
          description={t('Pages.Components.Subtitle')}
          actions={
            <Badge variant="secondary">atoms · molecules · organisms</Badge>
          }
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard title={t('Components.Atoms.Title')}>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button>{t('Components.Atoms.Primary')}</Button>
                <Button variant="secondary">
                  {t('Components.Atoms.Secondary')}
                </Button>
                <Button variant="outline">
                  {t('Components.Atoms.Outline')}
                </Button>
                <Button variant="outline" size="sm">
                  {t('Components.Atoms.OutlineSmall')}
                </Button>
                <Button variant="outline" size="lg">
                  {t('Components.Atoms.OutlineLarge')}
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{t('Components.Atoms.Badge')}</Badge>
                <Badge variant="secondary">
                  {t('Components.Atoms.BadgeAlt')}
                </Badge>
                <ExternalLink href="https://tanstack.com/router">
                  {t('Components.Atoms.ExternalLink')}
                </ExternalLink>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Checkbox
                  id="agree"
                  checked={agree}
                  onCheckedChange={value => setAgree(Boolean(value))}
                />
                <label htmlFor="agree" className="text-sm text-foreground">
                  {t('Components.Atoms.CheckboxLabel')}
                </label>
              </div>
              <Input
                placeholder={t('Components.Atoms.InputPlaceholder')}
                value={name}
                onChange={event => setName(event.target.value)}
              />
              <Select
                value={selectedFramework}
                onValueChange={setSelectedFramework}
                placeholder={t('Components.Atoms.SelectPlaceholder')}
                options={[
                  { value: 'react', label: 'React' },
                  { value: 'vue', label: 'Vue' },
                  { value: 'svelte', label: 'Svelte' },
                ]}
              />
              <Tooltip content={t('Components.Atoms.TooltipContent')}>
                <Button variant="outline">
                  {t('Components.Atoms.TooltipTrigger')}
                </Button>
              </Tooltip>
            </div>
          </SectionCard>

          <SectionCard
            title={t('Components.Molecules.Title')}
            description={t('Components.Molecules.Description')}
          >
            <div className="space-y-4">
              <InputWithHelper
                id="email"
                type="email"
                label={t('Components.Molecules.InputLabel')}
                placeholder="name@example.com"
                helperText={t('Components.Molecules.InputHelper')}
              />
              <InputWithHelper
                id="password"
                type="password"
                label={t('Components.Molecules.PasswordLabel')}
                placeholder="••••••••"
                error={t('Components.Molecules.PasswordError')}
              />
              <div className="flex gap-3">
                <ButtonWithSpinner isSubmitting>
                  {t('Components.Molecules.Submitting')}
                </ButtonWithSpinner>
                <ButtonWithSpinner spinnerPosition="right">
                  {t('Components.Molecules.Save')}
                </ButtonWithSpinner>
              </div>
              <div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      toast({
                        title: t('Components.Toast.Title'),
                        description: t('Components.Toast.Description'),
                        variant: 'success',
                      })
                    }
                  >
                    {t('Components.Toast.Action')}
                  </Button>
                  <Button
                    variant="destructive"
                    className="text-white"
                    onClick={() =>
                      toast({
                        title: t('Components.Toast.ErrorTitle'),
                        description: t('Components.Toast.ErrorDescription'),
                        variant: 'error',
                      })
                    }
                  >
                    {t('Components.Toast.ErrorAction')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      showConfirm(
                        t('Components.Molecules.Confirm.Title'),
                        t('Components.Molecules.Confirm.Description'),
                        () =>
                          toast({
                            title: t('Components.Molecules.Confirm.Success'),
                            variant: 'success',
                          }),
                        {
                          confirmText: t('Components.Molecules.Confirm.Confirm'),
                          cancelText: t('Components.Molecules.Confirm.Cancel'),
                          variant: 'destructive',
                        }
                      )
                    }
                  >
                    {t('Components.Molecules.Confirm.Action')}
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                <Tabs
                  defaultValue="tab-1"
                  items={[
                    {
                      value: 'tab-1',
                      label: t('Components.Molecules.Tabs.First'),
                      content: (
                        <p className="text-sm text-muted-foreground">
                          {t('Components.Molecules.Tabs.FirstContent')}
                        </p>
                      ),
                    },
                    {
                      value: 'tab-2',
                      label: t('Components.Molecules.Tabs.Second'),
                      content: (
                        <p className="text-sm text-muted-foreground">
                          {t('Components.Molecules.Tabs.SecondContent')}
                        </p>
                      ),
                    },
                  ]}
                />
                <div className="flex items-center gap-3">
                  <UserAvatar name="Jamie Rivera" />
                  <div className="text-sm">
                    <div className="font-medium text-foreground">
                      {t('Components.Molecules.UserAvatar.Title')}
                    </div>
                    <div className="text-muted-foreground">
                      {t('Components.Molecules.UserAvatar.Description')}
                    </div>
                  </div>
                </div>
                <DropdownMenu
                  label={t('Components.Molecules.Dropdown.Label')}
                  title={t('Components.Molecules.Dropdown.Title')}
                  triggerText={t('Components.Molecules.Dropdown.Trigger')}
                  items={[
                    {
                      label: t('Components.Molecules.Dropdown.ItemProfile'),
                      onSelect: () =>
                        toast({
                          title: t('Components.Molecules.Dropdown.ItemProfile'),
                        }),
                    },
                    {
                      label: t('Components.Molecules.Dropdown.ItemSettings'),
                      onSelect: () =>
                        toast({
                          title: t('Components.Molecules.Dropdown.ItemSettings'),
                        }),
                    },
                    {
                      label: t('Components.Molecules.Dropdown.ItemLogout'),
                      onSelect: () =>
                        toast({
                          title: t('Components.Molecules.Dropdown.ItemLogout'),
                          variant: 'warning',
                        }),
                      destructive: true,
                    },
                  ]}
                />
                <SheetPanel
                  title={t('Components.Molecules.Sheet.Title')}
                  description={t('Components.Molecules.Sheet.Description')}
                  triggerText={t('Components.Molecules.Sheet.Trigger')}
                >
                  <p>{t('Components.Molecules.Sheet.Body')}</p>
                  <p>{t('Components.Molecules.Sheet.BodySecondary')}</p>
                </SheetPanel>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title={t('Components.Molecules.Controls.Title')}
            description={t('Components.Molecules.Controls.Description')}
            className="lg:col-span-2"
          >
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {t('Components.Molecules.Controls.ToggleLabel')}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Toggle
                    pressed={toggleValue}
                    onPressedChange={setToggleValue}
                    aria-label={t('Components.Molecules.Controls.ToggleBold')}
                  >
                    <Bold className="size-4" />
                  </Toggle>
                  <Toggle aria-label={t('Components.Molecules.Controls.ToggleItalic')}>
                    <Italic className="size-4" />
                  </Toggle>
                  <Toggle aria-label={t('Components.Molecules.Controls.ToggleUnderline')}>
                    <Underline className="size-4" />
                  </Toggle>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {t('Components.Molecules.Controls.ToggleGroupLabel')}
                </p>
                <ToggleGroup
                  type="single"
                  value={toggleGroupValue}
                  onValueChange={value => {
                    if (value) setToggleGroupValue(value);
                  }}
                >
                  <ToggleGroupItem value="left" aria-label={t('Components.Molecules.Controls.ToggleGroupLeft')}>
                    <Bold className="size-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="center" aria-label={t('Components.Molecules.Controls.ToggleGroupCenter')}>
                    <Italic className="size-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="right" aria-label={t('Components.Molecules.Controls.ToggleGroupRight')}>
                    <Underline className="size-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t('Components.Molecules.Controls.TextareaLabel')}
                  </label>
                  <Textarea placeholder={t('Components.Molecules.Controls.TextareaPlaceholder')} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t('Components.Molecules.Controls.SwitchLabel')}
                  </label>
                  <div className="flex items-center gap-3">
                    <Switch checked={switchChecked} onCheckedChange={setSwitchChecked} />
                    <span className="text-sm text-muted-foreground">
                      {switchChecked
                        ? t('Components.Molecules.Controls.SwitchOn')
                        : t('Components.Molecules.Controls.SwitchOff')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {t('Components.Molecules.Controls.RadioLabel')}
                  </p>
                  <RadioGroup value={radioValue} onValueChange={setRadioValue}>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem id="radio-email" value="email" />
                      <label htmlFor="radio-email" className="text-sm">
                        {t('Components.Molecules.Controls.RadioEmail')}
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem id="radio-sms" value="sms" />
                      <label htmlFor="radio-sms" className="text-sm">
                        {t('Components.Molecules.Controls.RadioSms')}
                      </label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {t('Components.Molecules.Controls.OtpLabel')}
                  </p>
                  <InputOTP maxLength={6} value={otpValue} onChange={setOtpValue}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {t('Components.Molecules.Controls.BreadcrumbLabel')}
                  </p>
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbLink href="#">{t('Components.Molecules.Controls.BreadcrumbHome')}</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbLink href="#">{t('Components.Molecules.Controls.BreadcrumbComponents')}</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage>{t('Components.Molecules.Controls.BreadcrumbCurrent')}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {t('Components.Molecules.Controls.HoverCardLabel')}
                  </p>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button variant="outline">
                        <Mail className="size-4" />
                        <span>{t('Components.Molecules.Controls.HoverCardTrigger')}</span>
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {t('Components.Molecules.Controls.HoverCardTitle')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t('Components.Molecules.Controls.HoverCardContent')}
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        <SectionCard
          title={t('Components.Organisms.CardTitle')}
          description={t('Components.Organisms.CardDescription')}
        >
          <div className="max-w-md">
            <Card>
              <CardHeader>
                <CardTitle>{t('Components.Organisms.CardSampleTitle')}</CardTitle>
                <CardDescription>
                  {t('Components.Organisms.CardSampleDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t('Components.Organisms.CardSampleBody')}
                </p>
              </CardContent>
              <CardFooter className="justify-end">
                <Button size="sm">{t('Components.Organisms.CardSampleAction')}</Button>
              </CardFooter>
            </Card>
          </div>
        </SectionCard>

        <SectionCard
          title={t('Components.Organisms.Title')}
          description={t('Components.Organisms.Description')}
        >
          <EmptyState
            title={t('Components.Organisms.EmptyTitle')}
            description={t('Components.Organisms.EmptyDescription')}
            action={<Button>{t('Components.Organisms.EmptyAction')}</Button>}
          />
        </SectionCard>

        <SectionCard
          title={t('Components.Organisms.TableTitle')}
          description={t('Components.Organisms.TableDescription')}
        >
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-left">
                  <th className="px-4 py-2">{t('Components.Organisms.TableHeaderName')}</th>
                  <th className="px-4 py-2">{t('Components.Organisms.TableHeaderStatus')}</th>
                  <th className="px-4 py-2">{t('Components.Organisms.TableHeaderRole')}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="px-4 py-2">Alex Lee</td>
                  <td className="px-4 py-2">{t('Components.Organisms.TableStatusActive')}</td>
                  <td className="px-4 py-2">Admin</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2">Sam Doe</td>
                  <td className="px-4 py-2">{t('Components.Organisms.TableStatusPending')}</td>
                  <td className="px-4 py-2">Editor</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2">Casey Lin</td>
                  <td className="px-4 py-2">{t('Components.Organisms.TableStatusInactive')}</td>
                  <td className="px-4 py-2">Viewer</td>
                </tr>
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard
          title={t('Components.Organisms.SidebarDemo.Title')}
          description={t('Components.Organisms.SidebarDemo.Description')}
        >
          <div className="overflow-hidden rounded-md border">
            <SidebarProvider defaultOpen className="!min-h-0 h-full w-full">
              <div className="flex aspect-video w-full flex-col">
                <div className="flex items-center justify-between border-b bg-muted/10 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <SidebarTrigger />
                    <div className="text-sm font-semibold">
                      {t('Components.Organisms.SidebarDemo.NavbarTitle')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm">
                      <Plus className="size-4" />
                      <span>{t('Components.Organisms.SidebarDemo.PrimaryAction')}</span>
                    </Button>
                  </div>
                </div>
                <div
                  className="relative flex h-full flex-1 min-h-0"
                  style={
                    {
                      '--sidebar-width': '8rem',
                      '--sidebar-width-icon': '2rem',
                      '--sidebar-rail-width': '2.4rem',
                    } as React.CSSProperties
                  }
                >
                  <SidebarDemoRail />
                  <SidebarDemoSidebar />
                  <SidebarDemoContent />
                </div>
              </div>
            </SidebarProvider>
          </div>
        </SectionCard>

        <SectionCard
          title={t('Components.Organisms.DataTable.Title')}
          description={t('Components.Organisms.DataTable.Description')}
        >
          <DataTable
            data={demoData}
            columns={demoColumns}
            emptyLabel={t('Components.Organisms.DataTable.Empty')}
            searchPlaceholder={t('Components.Organisms.DataTable.SearchPlaceholder')}
            statusFilterLabel={t('Components.Organisms.DataTable.StatusFilterLabel')}
            statusAllLabel={t('Components.Organisms.DataTable.StatusAll')}
            exportCsvLabel={t('Components.Organisms.DataTable.ExportCsv')}
            printLabel={t('Components.Organisms.DataTable.Print')}
            rowsPerPageLabel={t('Components.Organisms.DataTable.RowsPerPage')}
            prevLabel={t('Components.Organisms.DataTable.Prev')}
            nextLabel={t('Components.Organisms.DataTable.Next')}
          />
        </SectionCard>

        <SectionCard
          title={t('Components.Organisms.ResizableTitle')}
          description={t('Components.Organisms.ResizableDescription')}
        >
          <div className="h-40 rounded-md border">
            <ResizablePanelGroup direction="horizontal" className="h-full">
              <ResizablePanel defaultSize={60} minSize={30}>
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  {t('Components.Organisms.ResizableLeft')}
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={40} minSize={20}>
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  {t('Components.Organisms.ResizableRight')}
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </SectionCard>

        <SectionCard
          title={t('Pages.Components.TanStackForm.Title')}
          description={t('Pages.Components.TanStackForm.Description')}
        >
          <form
            onSubmit={event => {
              event.preventDefault();
              event.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-4"
          >
            <form.Field
              name="fullName"
              validators={{
                onChange: ({ value }) => validateField('fullName', value),
                onBlur: ({ value }) => validateField('fullName', value),
              }}
            >
              {field => (
                <InputWithHelper
                  id={field.name}
                  label={t('Pages.Components.TanStackForm.NameLabel')}
                  placeholder={t('Pages.Components.TanStackForm.NamePlaceholder')}
                  value={field.state.value ?? ''}
                  onChange={event => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors[0] ?? undefined}
                />
              )}
            </form.Field>

            <form.Field
              name="email"
              validators={{
                onChange: ({ value }) => validateField('email', value),
                onBlur: ({ value }) => validateField('email', value),
              }}
            >
              {field => (
                <InputWithHelper
                  id={field.name}
                  type="email"
                  label={t('Pages.Components.TanStackForm.EmailLabel')}
                  placeholder={t(
                    'Pages.Components.TanStackForm.EmailPlaceholder'
                  )}
                  value={field.state.value ?? ''}
                  onChange={event => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors[0] ?? undefined}
                />
              )}
            </form.Field>

            <form.Field
              name="message"
              validators={{
                onChange: ({ value }) => validateField('message', value),
                onBlur: ({ value }) => validateField('message', value),
              }}
            >
              {field => (
                <InputWithHelper
                  id={field.name}
                  label={t('Pages.Components.TanStackForm.MessageLabel')}
                  placeholder={t(
                    'Pages.Components.TanStackForm.MessagePlaceholder'
                  )}
                  value={field.state.value ?? ''}
                  onChange={event => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors[0] ?? undefined}
                  helperText={t(
                    'Pages.Components.TanStackForm.MessageHelper'
                  )}
                />
              )}
            </form.Field>

            <form.Subscribe
              selector={state => ({
                canSubmit: state.canSubmit,
                isSubmitting: state.isSubmitting,
              })}
            >
              {({ canSubmit, isSubmitting }) => (
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                  >
                    {t('Pages.Components.TanStackForm.Submit')}
                  </Button>
                </div>
              )}
            </form.Subscribe>
          </form>
        </SectionCard>
        <ConfirmDialog
          open={dialogState.isOpen}
          onOpenChange={open => {
            if (!open) {
              hideConfirm();
            }
          }}
          title={dialogState.title}
          description={dialogState.description}
          confirmText={dialogState.confirmText}
          cancelText={dialogState.cancelText}
          variant={dialogState.variant}
          onConfirm={handleConfirm}
        />
      </div>
    </MainPageLayout>
  );
};
