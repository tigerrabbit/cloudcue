import importlib.util
import json
from pathlib import Path
import shutil
import tempfile
import unittest

PROJECT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("notices", PROJECT / "scripts/generate-distribution-notices.py")
notices = importlib.util.module_from_spec(spec)
spec.loader.exec_module(notices)


class BackportNoticeTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name).resolve()
        shutil.copytree(PROJECT / "vendor/glib-0.18.5", self.root / "vendor/glib-0.18.5")
        shutil.copyfile(PROJECT / "vendor/provenance.json", self.root / "vendor/provenance.json")
        self.previous = notices.ROOT
        notices.ROOT = self.root
        self.package = {"name": "glib", "version": "0.18.5", "source": None, "license": "MIT",
                        "manifest_path": str(self.root / "vendor/glib-0.18.5/Cargo.toml")}

    def tearDown(self):
        notices.ROOT = self.previous
        self.temp.cleanup()

    def test_reviewed_source_and_mit_terms(self):
        record = notices.local_backport_info(self.package)
        self.assertEqual(len(record["files"]), 120)
        texts, _ = notices.package_notices(self.package, self.root, {})
        self.assertTrue(notices.covered(notices.parse_expression("MIT"),
                                       set().union(*(notices.has_terms(t[1]) for t in texts))))

    def test_other_identities_and_source_paths_are_rejected(self):
        for key, value in [("name", "other"), ("version", "0.20.0"), ("license", "Apache-2.0"),
                           ("source", "git+https://example.org/glib"),
                           ("manifest_path", str(self.root / "other/Cargo.toml"))]:
            package = dict(self.package, **{key: value})
            with self.subTest(key=key), self.assertRaises(notices.NoticeError):
                notices.local_backport_info(package)

    def test_modified_file_is_rejected(self):
        path = self.root / "vendor/glib-0.18.5/src/variant_iter.rs"
        path.write_text(path.read_text() + "\n// changed\n")
        with self.assertRaises(notices.NoticeError):
            notices.local_backport_info(self.package)

    def test_missing_file_is_rejected(self):
        (self.root / "vendor/glib-0.18.5/LICENSE").unlink()
        with self.assertRaises(notices.NoticeError):
            notices.local_backport_info(self.package)

    def test_unrecorded_build_script_is_rejected(self):
        (self.root / "vendor/glib-0.18.5/build.rs").write_text("fn main() {}")
        with self.assertRaises(notices.NoticeError):
            notices.local_backport_info(self.package)

    def test_symlink_is_rejected(self):
        path = self.root / "vendor/glib-0.18.5/LICENSE"
        path.unlink()
        path.symlink_to(PROJECT / "LICENSE")
        with self.assertRaises(notices.NoticeError):
            notices.local_backport_info(self.package)

    def test_changed_upstream_archive_is_rejected(self):
        path = self.root / "vendor/provenance.json"
        record = json.loads(path.read_text())
        record["glib-0.18.5"]["archiveSha256"] = "0" * 64
        path.write_text(json.dumps(record))
        with self.assertRaises(notices.NoticeError):
            notices.local_backport_info(self.package)

    def test_only_target_reachable_packages_receive_notices(self):
        root = {"id": "app", "name": "cloudcue", "manifest_path": str(self.root / "src-tauri/Cargo.toml")}
        glib = dict(self.package, id="glib")
        for dependencies in [[], ["glib"]]:
            metadata = {"packages": [root, glib], "resolve": {"root": "app", "nodes": [
                {"id": "app", "dependencies": dependencies}, {"id": "glib", "dependencies": []}]}}
            _, packages = notices.resolved_packages(metadata)
            self.assertEqual([p["name"] for p in packages], ["glib"] if dependencies else [])


if __name__ == "__main__":
    unittest.main()
