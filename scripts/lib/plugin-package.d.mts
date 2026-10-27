interface PackageManifest {
  name: string;
  version: string;
  devDependencies?: Record<string, string>;
  dependencies?: Record<string, string>;
  overrides?: Record<string, unknown>;
  [key: string]: unknown;
}

interface LockedPackage {
  version?: string;
  dev?: boolean;
  [key: string]: unknown;
}

interface PackageLock {
  name: string;
  version: string;
  lockfileVersion: number;
  packages: Record<string, LockedPackage>;
  [key: string]: unknown;
}

export function pluginPackageMetadata<Manifest extends PackageManifest>(
  manifest: Manifest,
  lock: PackageLock,
): {
  packageJson: Omit<Manifest, "devDependencies" | "overrides"> & {
    bundleDependencies: string[];
  };
  shrinkwrap: PackageLock;
};
