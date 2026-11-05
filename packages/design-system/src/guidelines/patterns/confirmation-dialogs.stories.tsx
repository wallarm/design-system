import { type ChangeEvent, useState } from 'react';
import { fn } from 'storybook/test';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/Dialog';
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '../../components/Drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemText,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/DropdownMenu';
import { Field, FieldLabel } from '../../components/Field';
import { Input } from '../../components/Input';
import {
  Page,
  PageActions,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderGroup,
  PageTitle,
} from '../../components/Page';
import type { TableCellContext, TableColumnDef } from '../../components/Table';
import { Table } from '../../components/Table';
import { useToast } from '../../components/Toast';
import { Ellipsis } from '../../icons';

type UserStatus = 'active' | 'deactivated';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: UserStatus;
}

const USERS: User[] = [
  {
    id: 'u-1042',
    name: 'Maria Lopez',
    email: 'maria.lopez@acme-bank.com',
    role: 'Administrator',
    status: 'active',
  },
  {
    id: 'u-1043',
    name: 'Daniel Okafor',
    email: 'daniel.okafor@acme-bank.com',
    role: 'Security analyst',
    status: 'active',
  },
  {
    id: 'u-1058',
    name: 'Tomás Herrera',
    email: 'tomas.herrera@acme-bank.com',
    role: 'Deploy',
    status: 'active',
  },
  {
    id: 'u-1060',
    name: 'Anna Schmidt',
    email: 'anna.schmidt@acme-bank.com',
    role: 'Read only',
    status: 'deactivated',
  },
];

const PROVIDER_NAME = 'Okta Production';

// Stand-ins for the app's API requests: each resolves after 800ms so the pending state shows.
const request = (..._args: unknown[]) => new Promise<void>(resolve => setTimeout(resolve, 800));
const deleteUser = fn(request).mockName('deleteUser');
const setUserStatus = fn(request).mockName('setUserStatus');
const deleteProvider = fn(request).mockName('deleteProvider');
const saveProvider = fn(request).mockName('saveProvider');

const getUserId = (user: User) => user.id;

const meta = {
  title: 'Patterns/Confirmation dialogs',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Use when an action deletes, disables or overwrites something, or when closing a form would lose unsaved changes, and the user must confirm first.',
      },
    },
  },
  // The host shell gives a page its height; 640px stands in for it.
  decorators: [
    Story => (
      <div className='h-640'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;

/**
 * Delete and state-change confirmations opened from a table's actions menu. Each dialog has its
 * own controlled `open` state, set by the menu item. Delete and deactivate use a destructive
 * confirm; activate grants access, so it keeps the brand confirm. While the request runs the
 * confirm shows a spinner and close requests are ignored; on success the dialog closes, the
 * row updates and a toast reports the result.
 */
export const Default: StoryFn = () => {
  const toast = useToast();
  const [users, setUsers] = useState(USERS);
  const [selected, setSelected] = useState<User | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const isActive = selected?.status === 'active';

  const renderStatus = ({ row }: TableCellContext<User, unknown>) =>
    row.original.status === 'active' ? (
      <Badge variant='dotted' type='secondary' color='green'>
        Active
      </Badge>
    ) : (
      <Badge variant='dotted' type='secondary' color='gray'>
        Deactivated
      </Badge>
    );

  const renderActions = ({ row }: TableCellContext<User, unknown>) => {
    const user = row.original;
    const handleStatusSelect = () => {
      setSelected(user);
      setStatusOpen(true);
    };
    const handleDeleteSelect = () => {
      setSelected(user);
      setDeleteOpen(true);
    };

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            color='neutral'
            size='small'
            aria-label={`Actions for ${user.name}`}
            data-testid='users-actions'
          >
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={handleStatusSelect} data-testid='users-change-status'>
            <DropdownMenuItemText>
              {user.status === 'active' ? 'Deactivate' : 'Activate'}
            </DropdownMenuItemText>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant='destructive'
            onSelect={handleDeleteSelect}
            data-testid='users-delete'
          >
            <DropdownMenuItemText>Delete user</DropdownMenuItemText>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const columns: TableColumnDef<User>[] = [
    { accessorKey: 'name', header: 'Name', size: 220 },
    { accessorKey: 'email', header: 'Email', size: 280 },
    { accessorKey: 'role', header: 'Role', size: 180 },
    { accessorKey: 'status', header: 'Status', size: 140, cell: renderStatus },
    {
      id: 'actions',
      header: '',
      size: 60,
      minSize: 60,
      enableHiding: false,
      cell: renderActions,
    },
  ];

  const handleDeleteOpenChange = (next: boolean) => {
    if (!pending) setDeleteOpen(next);
  };

  const handleStatusOpenChange = (next: boolean) => {
    if (!pending) setStatusOpen(next);
  };

  const handleDelete = async () => {
    if (!selected) return;
    setPending(true);
    try {
      await deleteUser(selected.id);
      setUsers(prev => prev.filter(user => user.id !== selected.id));
      setDeleteOpen(false);
      toast.create({ title: 'User deleted', type: 'default' });
    } catch {
      toast.create({ title: "Couldn't delete user", type: 'error' });
    } finally {
      setPending(false);
    }
  };

  const handleStatusChange = async () => {
    if (!selected) return;
    const status: UserStatus = isActive ? 'deactivated' : 'active';
    setPending(true);
    try {
      await setUserStatus(selected.id, status);
      setUsers(prev => prev.map(user => (user.id === selected.id ? { ...user, status } : user)));
      setStatusOpen(false);
      toast.create({ title: isActive ? 'User deactivated' : 'User activated', type: 'default' });
    } catch {
      toast.create({ title: "Couldn't update user", type: 'error' });
    } finally {
      setPending(false);
    }
  };

  return (
    <Page name='settings-users' fullSize fixedHeight data-testid='users-page'>
      <PageHeader>
        <PageHeaderGroup>
          <PageTitle>Users</PageTitle>
          <PageDescription>
            People who can sign in to your organization, with access set by roles and groups.
          </PageDescription>
        </PageHeaderGroup>
      </PageHeader>

      <PageContent>
        <Table
          aria-label='Users'
          data={users}
          columns={columns}
          getRowId={getUserId}
          data-testid='users-table'
        />
      </PageContent>

      <Dialog
        width={400}
        open={deleteOpen}
        onOpenChange={handleDeleteOpenChange}
        data-testid='delete-user-dialog'
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete user?</DialogTitle>
            <DialogDescription>
              This permanently deletes {selected?.name} and all their access. You can't undo this.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='ghost' color='neutral' data-testid='delete-user-cancel'>
                Cancel
              </Button>
            </DialogClose>
            <Button
              color='destructive'
              loading={pending}
              onClick={handleDelete}
              data-testid='delete-user-confirm'
            >
              Delete user
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        width={400}
        open={statusOpen}
        onOpenChange={handleStatusOpenChange}
        data-testid='user-status-dialog'
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isActive ? 'Deactivate user?' : 'Activate user?'}</DialogTitle>
            <DialogDescription>
              {isActive
                ? `${selected?.name} loses access until you reactivate them. Their roles and data are kept.`
                : `${selected?.name} can sign in again with the roles they had before.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='ghost' color='neutral'>
                Cancel
              </Button>
            </DialogClose>
            <Button
              color={isActive ? 'destructive' : 'brand'}
              loading={pending}
              onClick={handleStatusChange}
            >
              {isActive ? 'Deactivate user' : 'Activate user'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Page>
  );
};

/**
 * Type-to-confirm for a delete that also breaks linked objects. The dialog keeps its default
 * 560px width, the confirm stays disabled until the input matches the name exactly
 * (case-sensitive), and closing the dialog resets the input to `''`.
 */
export const TypeToConfirm: StoryFn = () => {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [pending, setPending] = useState(false);

  const handleOpen = () => setOpen(true);

  const handleOpenChange = (next: boolean) => {
    if (pending) return;
    setOpen(next);
    if (!next) setValue('');
  };

  const handleValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const handleDelete = async () => {
    setPending(true);
    try {
      await deleteProvider(PROVIDER_NAME);
      setOpen(false);
      setValue('');
      toast.create({ title: 'Identity provider deleted', type: 'default' });
    } catch {
      toast.create({ title: "Couldn't delete identity provider", type: 'error' });
    } finally {
      setPending(false);
    }
  };

  return (
    <Page name='settings-sso-provider' fullSize fixedHeight data-testid='provider-page'>
      <PageHeader>
        <PageHeaderGroup className='flex-1'>
          <PageTitle>{PROVIDER_NAME}</PageTitle>
          <PageDescription>SAML identity provider for single sign-on.</PageDescription>
        </PageHeaderGroup>
        <PageActions>
          <Button
            size='medium'
            variant='outline'
            color='destructive'
            onClick={handleOpen}
            data-testid='provider-delete'
          >
            Delete identity provider
          </Button>
        </PageActions>
      </PageHeader>

      <Dialog open={open} onOpenChange={handleOpenChange} data-testid='delete-provider-dialog'>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete identity provider?</DialogTitle>
            <DialogDescription>
              "{PROVIDER_NAME}" is unlinked and deleted, along with its rules. You can't undo this.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <Input
              aria-label='Provider name'
              placeholder={`Enter "${PROVIDER_NAME}" to confirm`}
              value={value}
              onChange={handleValueChange}
              data-testid='delete-provider-input'
            />
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='ghost' color='neutral'>
                Cancel
              </Button>
            </DialogClose>
            <Button
              color='destructive'
              disabled={value !== PROVIDER_NAME}
              loading={pending}
              onClick={handleDelete}
              data-testid='delete-provider-confirm'
            >
              Delete identity provider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Page>
  );
};

/**
 * An unsaved-changes guard. The drawer's `onOpenChange(false)` is intercepted while the form is
 * dirty, so the close X, Cancel, `Escape` and an outside click all open the same dialog. The
 * dialog renders inside `DrawerContent` and keeps the default 560px width.
 */
export const UnsavedChanges: StoryFn = () => {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [guardOpen, setGuardOpen] = useState(false);
  const [savedName, setSavedName] = useState(PROVIDER_NAME);
  const [name, setName] = useState(PROVIDER_NAME);
  const [saving, setSaving] = useState(false);

  const isDirty = name !== savedName;

  const handleOpen = () => setOpen(true);

  const handleDrawerOpenChange = (next: boolean) => {
    if (saving) return;
    if (!next && isDirty) {
      setGuardOpen(true);
      return;
    }
    setOpen(next);
  };

  const handleGuardOpenChange = (next: boolean) => {
    if (!saving) setGuardOpen(next);
  };

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleLeave = () => {
    setName(savedName);
    setGuardOpen(false);
    setOpen(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveProvider({ name });
      setSavedName(name);
      setGuardOpen(false);
      setOpen(false);
      toast.create({ title: 'Identity provider updated', type: 'default' });
    } catch {
      toast.create({ title: "Couldn't update identity provider", type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Page name='settings-sso-provider' fullSize fixedHeight data-testid='provider-page'>
      <PageHeader>
        <PageHeaderGroup className='flex-1'>
          <PageTitle>{savedName}</PageTitle>
          <PageDescription>SAML identity provider for single sign-on.</PageDescription>
        </PageHeaderGroup>
        <PageActions>
          <Button size='medium' onClick={handleOpen} data-testid='provider-edit'>
            Edit identity provider
          </Button>
        </PageActions>
      </PageHeader>

      <Drawer open={open} onOpenChange={handleDrawerOpenChange} data-testid='edit-provider-drawer'>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Edit identity provider</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            <Field>
              <FieldLabel>Display name</FieldLabel>
              <Input value={name} onChange={handleNameChange} data-testid='provider-name' />
            </Field>
          </DrawerBody>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant='ghost' color='neutral'>
                Cancel
              </Button>
            </DrawerClose>
            <Button disabled={!isDirty} loading={saving} onClick={handleSave}>
              Save changes
            </Button>
          </DrawerFooter>

          <Dialog
            open={guardOpen}
            onOpenChange={handleGuardOpenChange}
            data-testid='unsaved-changes-dialog'
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Unsaved changes</DialogTitle>
                <DialogDescription>
                  You have unsaved changes. Leaving will lose them unless you save.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant='ghost' color='neutral' data-testid='unsaved-changes-keep'>
                    Keep editing
                  </Button>
                </DialogClose>
                <Button
                  variant='ghost'
                  color='neutral'
                  onClick={handleLeave}
                  data-testid='unsaved-changes-leave'
                >
                  Leave without saving
                </Button>
                <Button loading={saving} onClick={handleSave}>
                  Save changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </DrawerContent>
      </Drawer>
    </Page>
  );
};
